"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import {
  Calendar,
  ChevronDown,
  MapPin,
  Satellite,
  Smile,
  X,
} from "lucide-react";
import { v4 as uuid } from "uuid";

import type { PromptInputMessage } from "@galileyo/ui/ai-elements";
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Label,
  SearchableSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@galileyo/ui";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  usePromptInputAttachments,
} from "@galileyo/ui/ai-elements";
import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@galileyo/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";
import { toast } from "@galileyo/ui/toast";

import type { Location } from "../map/location-search";
import type { User } from "~/auth/client";
import type { Profile } from "~/hooks/use-profiles";
import { useAbility } from "~/hooks/use-ability";
import { usePlanSwitch } from "~/hooks/use-plan-switch";
import { useProfiles } from "~/hooks/use-profiles";
import { getProfilePicture } from "~/lib/user";
import { useTRPC } from "~/trpc/react";
import { LocationSearch } from "../map/location-search";
import { DateTimePickerPopover } from "../ui/date-time-picker";
import { UserAvatar } from "./user-avatar";

const DEFAULT_TIMEZONE = "UTC";
const CONTENT_LIMIT = 512;

interface TimeZoneOption {
  value: string;
  label: string;
  commonName: string;
  offsetName: string;
}

const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

const getTimeZoneName = (
  timeZone: string,
  timeZoneName: Intl.DateTimeFormatOptions["timeZoneName"],
) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date());

    const zoneNamePart = parts.find((part) => part.type === "timeZoneName");
    return zoneNamePart ? zoneNamePart.value.trim() : "";
  } catch {
    return "";
  }
};

const toUtcOffset = (offsetName: string) => {
  if (!offsetName) {
    return "UTC";
  }

  if (offsetName === "GMT") {
    return "UTC";
  }

  const offsetMatch = /^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(offsetName);
  if (!offsetMatch) {
    return offsetName.replace("GMT", "UTC");
  }

  const [, sign, hoursRaw, minutesRaw = "00"] = offsetMatch;
  const hours = hoursRaw?.padStart(2, "0") ?? "00";
  const minutes = minutesRaw.padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
};

const normalizeCommonName = (name: string, timeZone: string) => {
  if (
    timeZone === DEFAULT_TIMEZONE ||
    timeZone === "Etc/UTC" ||
    name.toLowerCase().includes("universal")
  ) {
    return "UTC";
  }

  return name || timeZone;
};

const getTimeZoneOptions = (): TimeZoneOption[] => {
  let zones: string[] = [];

  if ("supportedValuesOf" in Intl) {
    zones = Intl.supportedValuesOf("timeZone");
  }

  if (zones.length === 0) {
    return [
      {
        value: DEFAULT_TIMEZONE,
        label: "UTC (UTC)",
        commonName: "UTC",
        offsetName: "UTC",
      },
    ];
  }

  return zones.map((zone) => {
    const commonName = normalizeCommonName(
      getTimeZoneName(zone, "longGeneric"),
      zone,
    );
    const offsetName = toUtcOffset(getTimeZoneName(zone, "shortOffset"));
    return {
      value: zone,
      label: `${commonName} (${offsetName}) - ${zone}`,
      commonName,
      offsetName,
    };
  });
};

const LocationPickerMap = dynamic(
  () =>
    import("../map/location-picker-maplibre").then(
      (module) => module.LocationPickerMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full animate-pulse rounded-lg border bg-muted" />
    ),
  },
);

interface AttachmentManagerContext {
  clear: () => void;
  setClear: (clear: () => void) => void;
}

const AttachmentManagerContext = createContext<AttachmentManagerContext | null>(
  null,
);

const useAttachmentManager = () => {
  const context = useContext(AttachmentManagerContext);
  if (!context) {
    throw new Error(
      "useAttachmentManager must be used within a AttachmentManagerContext",
    );
  }
  return context;
};

function AttachmentManager({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const [clear, setClear] = useState(() => () => {});

  const setClearCb = useCallback((clear: () => void) => {
    setClear(clear);
  }, []);

  return (
    <AttachmentManagerContext.Provider value={{ clear, setClear: setClearCb }}>
      {children}
    </AttachmentManagerContext.Provider>
  );
}

function AttachmentWatcher() {
  const { setClear } = useAttachmentManager();
  const attachments = usePromptInputAttachments();

  useEffect(() => {
    setClear(() => attachments.clear);
  }, [attachments.clear, setClear]);

  return <></>;
}

function ProfilePreviewContent({
  user,
  activeProfile,
  children,
}: {
  user: User;
  activeProfile: Profile | null | undefined;
  children?: React.ReactNode | React.ReactNode[];
}) {
  return (
    <>
      <span className="text-xs text-muted-foreground">Posting as</span>
      {activeProfile ? (
        <UserAvatar
          name={activeProfile.name}
          image={activeProfile.avatar ?? null}
          isVerified={false}
          isInfluencer={false}
          size="small"
          // onlyAvatar={true}
        />
      ) : (
        <UserAvatar
          name={user.name}
          image={getProfilePicture(user)}
          isVerified={user.isVerified ?? false}
          isInfluencer={false}
          size="small"
          // onlyAvatar={true}
        />
      )}
      {children}
    </>
  );
}

// Helper component for labeled toolbar buttons with consistent styling
function FeatureButton({
  icon: Icon,
  label,
  active,
  onClick,
  tooltip,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  tooltip?: string;
}) {
  const buttonContent = (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "gap-1.5 text-xs",
        active && "bg-primary/10 text-primary hover:bg-primary/20",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
}

// Component to display active features as dismissible badges
function ActiveFeaturesRow({
  isScheduled,
  scheduledDate,
  selectedLocation,
  useSatelliteVersion,
  satelliteContent,
  selectedTimezoneLabel,
  onClearSchedule,
  onClearLocation,
  onClearSatellite,
}: {
  isScheduled: boolean;
  scheduledDate: Date | undefined;
  selectedLocation: Location | null;
  useSatelliteVersion: boolean;
  satelliteContent: string;
  selectedTimezoneLabel: string;
  onClearSchedule: () => void;
  onClearLocation: () => void;
  onClearSatellite: () => void;
}) {
  const hasActiveFeatures =
    isScheduled || selectedLocation !== null || useSatelliteVersion;

  if (!hasActiveFeatures) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-border/50 px-3 pb-2">
      {isScheduled && scheduledDate && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 py-1 pl-2 pr-1"
        >
          <Calendar className="h-3 w-3" />
          <span className="max-w-[220px] truncate text-xs">
            Scheduled: {format(scheduledDate, "MMM d, h:mm a")} (
            {selectedTimezoneLabel})
          </span>
          <button
            type="button"
            onClick={onClearSchedule}
            aria-label="Remove schedule"
            className="ml-1 rounded-full p-1 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove schedule</span>
          </button>
        </Badge>
      )}
      {selectedLocation && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 py-1 pl-2 pr-1"
        >
          <MapPin className="h-3 w-3" />
          <span className="max-w-[150px] truncate text-xs">
            {selectedLocation.display_name.split(",")[0]}
          </span>
          <button
            type="button"
            onClick={onClearLocation}
            aria-label="Remove location"
            className="ml-1 rounded-full p-1 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove location</span>
          </button>
        </Badge>
      )}
      {useSatelliteVersion && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 py-1 pl-2 pr-1"
        >
          <Satellite className="h-3 w-3" />
          <span className="text-xs">
            Satellite mode
            {satelliteContent ? ` (${satelliteContent.length}/140)` : ""}
          </span>
          <button
            type="button"
            onClick={onClearSatellite}
            aria-label="Remove satellite mode"
            className="ml-1 rounded-full p-1 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove satellite mode</span>
          </button>
        </Badge>
      )}
    </div>
  );
}

function CreatePostComponent({ user }: { user: User }) {
  const ability = useAbility();
  const { showPlansModal } = usePlanSwitch();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { clear: clearAttachments } = useAttachmentManager();

  const { profiles } = useProfiles();

  const [postId, setPostId] = useState<string>(() => uuid());
  const [content, setContent] = useState("");
  const [whoCanSee, setWhoCanSee] = useState<"public" | "friends">("public");
  const [satelliteContent, setSatelliteContent] = useState("");
  const [focusOnContent, setFocusOnContent] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const [useSatelliteVersion, setUseSatelliteVersion] = useState(false);
  const [isSatelliteVersionOpen, setIsSatelliteVersionOpen] = useState(false);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    addDays(new Date(), 1),
  );
  const [selectedTimezone, setSelectedTimezone] =
    useState<string>(getBrowserTimeZone);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const timezoneOptions = useMemo(() => getTimeZoneOptions(), []);

  useEffect(() => {
    if (
      !timezoneOptions.some((timezone) => timezone.value === selectedTimezone)
    ) {
      setSelectedTimezone(DEFAULT_TIMEZONE);
    }
  }, [selectedTimezone, timezoneOptions]);
  const selectedTimezoneOption = useMemo(
    () =>
      timezoneOptions.find((timezone) => timezone.value === selectedTimezone),
    [selectedTimezone, timezoneOptions],
  );
  const selectedTimezoneLabel =
    selectedTimezoneOption?.commonName ?? selectedTimezone;
  const selectedTimezoneDetails = selectedTimezoneOption
    ? `${selectedTimezoneOption.commonName} (${selectedTimezoneOption.offsetName})`
    : selectedTimezone;

  const activeProfile = useMemo(() => {
    return profiles.find((profile) => profile.id === selectedProfile);
  }, [profiles, selectedProfile]);

  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent.length === 0;
  const contentCount = content.length;
  const isNearLimit = contentCount >= 460;

  const createPost = useMutation(
    trpc.feed.createPost.mutationOptions({
      onSuccess: async () => {
        toast.success("Post created successfully");

        // // Reset form
        setContent("");
        setSatelliteContent("");
        setUseSatelliteVersion(false);
        setIsScheduled(false);
        setScheduledDate(addDays(new Date(), 1));
        setSelectedLocation(null);
        clearAttachments();
        setPostId(uuid());

        await queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create post");
      },
    }),
  );

  const handleSubmit = (message: PromptInputMessage) => {
    try {
      if (isContentEmpty) {
        return;
      }

      if (isScheduled && !scheduledDate) {
        toast.error("Choose a date and time for your scheduled post.");
        return;
      }

      const scheduledFor = isScheduled ? scheduledDate : undefined;
      const scheduleValue = scheduledFor
        ? format(scheduledFor, "yyyy-MM-dd HH:mm:ss")
        : "";

      const formData = new FormData();
      formData.append("text", content);
      formData.append("uuid", postId);
      if (satelliteContent.trim().length > 0 && useSatelliteVersion) {
        formData.append("satellite_text", satelliteContent);
      }

      if (activeProfile?.id) {
        formData.append("subscriptions[]", activeProfile.id);
      } else {
        formData.append("subscriptions[]", "");
        formData.append("user_feed", whoCanSee);
      }

      formData.append("schedule", scheduleValue);
      formData.append("timezone", selectedTimezone);
      formData.append("is_schedule", isScheduled ? "1" : "0");

      if (selectedLocation) {
        formData.append("location[latitude]", selectedLocation.lat.toString());
        formData.append("location[longitude]", selectedLocation.lon.toString());
      }

      message.files?.forEach((file) => {
        formData.append("files[]", file.file);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      createPost.mutate(formData as any);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const addEmoji = useCallback(
    (emoji: string, target: "content" | "satellite") => {
      if (target === "content") {
        setContent((prev) => prev + emoji);
      } else {
        setSatelliteContent((prev) => prev + emoji);
      }
    },
    [],
  );

  const canPost = ability.can("use", "can_post");

  const isTestAccount = user.email.trim().toLowerCase() === "test@galileyo.com";

  if (isTestAccount) {
    return null;
  }

  if (!canPost) {
    return (
      <div className="flex w-full items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            You can&apos;t create posts on your current plan.
          </p>
          <p className="text-xs text-muted-foreground">
            To start posting, please switch to a plan that includes posting
            capabilities.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={() => showPlansModal(true)}
        >
          Switch plan
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2">
      <PromptInput
        className="relative border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50"
        onSubmit={handleSubmit}
        globalDrop
        multiple
        accept="image/*"
      >
        <AttachmentWatcher />
        <PromptInputBody>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea
            placeholder="What's on your mind?"
            onChange={(e) => setContent(e.target.value)}
            rows={focusOnContent || content.length > 0 ? 4 : 2}
            onFocus={() => setFocusOnContent(true)}
            showChildren={focusOnContent || content.length > 0}
            value={content}
            maxLength={CONTENT_LIMIT}
          >
            <div className="flex w-full flex-wrap items-center gap-2">
              {profiles.length >= 1 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 p-2"
                      type="button"
                    >
                      <ProfilePreviewContent
                        user={user}
                        activeProfile={activeProfile}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </ProfilePreviewContent>
                    </Button>
                    {/* <Button
                      variant="ghost"
                      className="flex items-center gap-2 p-2"
                    >
                      <span className="text-xs text-muted-foreground">
                        Posting as
                      </span>
                      {activeProfile ? (
                        <UserAvatar
                          name={activeProfile.name}
                          image={activeProfile.avatar ?? null}
                          isVerified={false}
                          isInfluencer={false}
                          size="small"
                          // onlyAvatar={true}
                        />
                      ) : (
                        <UserAvatar
                          name={user.name}
                          image={getProfilePicture(user)}
                          isVerified={user.isVerified ?? false}
                          isInfluencer={false}
                          size="small"
                          // onlyAvatar={true}
                        />
                      )}
                      <ChevronDown className="h-4 w-4" />
                    </Button> */}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
                    {profiles
                      .filter((profile) => profile.id !== activeProfile?.id)
                      .map((profile) => (
                        <DropdownMenuItem
                          key={`${profile.id}-${profile.role}`}
                          onClick={() => setSelectedProfile(profile.id)}
                        >
                          <UserAvatar
                            name={profile.name}
                            image={profile.avatar ?? null}
                            isVerified={profile.role === "influencer"}
                            isInfluencer={profile.role === "influencer"}
                            size="small"
                          />
                        </DropdownMenuItem>
                      ))}
                    {activeProfile && (
                      <DropdownMenuItem
                        key="main"
                        onClick={() => setSelectedProfile(null)}
                      >
                        <UserAvatar
                          name={user.name}
                          image={getProfilePicture(user)}
                          isVerified={user.isVerified ?? false}
                          isInfluencer={false}
                          size="small"
                        />
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 p-2">
                  <ProfilePreviewContent
                    user={user}
                    activeProfile={activeProfile}
                  />
                </div>
              )}
              {activeProfile === undefined && (
                <div className="flex items-center gap-2">
                  {/* <span className="text-xs text-muted-foreground">Who can see:</span> */}
                  <Select
                    value={whoCanSee}
                    onValueChange={(value) =>
                      setWhoCanSee(value as "public" | "friends")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who can see?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PromptInputTextarea>
        </PromptInputBody>
        <PromptInputToolbar className="flex-col gap-2">
          {/* Active features row - shows enabled options as dismissible badges */}
          <ActiveFeaturesRow
            isScheduled={isScheduled}
            scheduledDate={scheduledDate}
            selectedLocation={selectedLocation}
            useSatelliteVersion={useSatelliteVersion}
            satelliteContent={satelliteContent}
            selectedTimezoneLabel={selectedTimezoneLabel}
            onClearSchedule={() => setIsScheduled(false)}
            onClearLocation={() => setSelectedLocation(null)}
            onClearSatellite={() => {
              setUseSatelliteVersion(false);
              setSatelliteContent("");
            }}
          />
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <PromptInputTools className="flex-wrap gap-1.5">
              {/* Media actions */}
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger aria-label="Add photos" />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments label="Add photo(s)" />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              {/* Emoji picker - icon only as it's universally understood */}
              <PromptInputButton asChild>
                <Popover modal={true}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Add emoji"
                          >
                            <Smile className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Add emoji</span>
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Add emoji</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <PopoverContent className="w-fit p-0">
                    <EmojiPicker
                      className="h-[342px]"
                      locale="en"
                      onEmojiSelect={({ emoji }) => {
                        addEmoji(emoji, "content");
                      }}
                    >
                      <EmojiPickerSearch />
                      <EmojiPickerContent />
                      <EmojiPickerFooter />
                    </EmojiPicker>
                  </PopoverContent>
                </Popover>
              </PromptInputButton>

              {/* Visual separator between media and feature actions */}
              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Feature actions with labels */}
              <FeatureButton
                icon={Calendar}
                label="Schedule"
                active={isScheduled}
                onClick={() => setIsScheduleOpen(true)}
                tooltip="Schedule your post for a later time"
              />
              <FeatureButton
                icon={MapPin}
                label="Location"
                active={!!selectedLocation}
                onClick={() => setIsLocationOpen(true)}
                tooltip="Add a location to your post"
              />
              <FeatureButton
                icon={Satellite}
                label="Satellite"
                active={useSatelliteVersion}
                onClick={() => setIsSatelliteVersionOpen(true)}
                tooltip="Create a shorter version for satellite devices"
              />
            </PromptInputTools>
            <PromptInputSubmit
              disabled={isContentEmpty || createPost.isPending}
              status={createPost.isPending ? "submitted" : undefined}
              size="md"
              additionalContent={
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    isNearLimit && "font-medium text-amber-600",
                  )}
                >
                  {contentCount}/{CONTENT_LIMIT}
                </span>
              }
            />
          </div>
        </PromptInputToolbar>
      </PromptInput>

      <Dialog
        open={isSatelliteVersionOpen}
        onOpenChange={setIsSatelliteVersionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-muted-foreground" />
              Satellite Mode
            </DialogTitle>
            <DialogDescription>
              Create a shorter version of your post (max 140 characters) for
              users on satellite devices with limited bandwidth. This version
              will only be shown to satellite device users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <div className="space-y-0.5">
                <Label
                  htmlFor="satellite-version"
                  className="text-sm font-medium"
                >
                  Enable satellite version
                </Label>
                <p className="text-xs text-muted-foreground">
                  Toggle on to add a low-bandwidth version of your post
                </p>
              </div>
              <Switch
                id="satellite-version"
                checked={useSatelliteVersion}
                onCheckedChange={setUseSatelliteVersion}
              />
            </div>
            {useSatelliteVersion && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="satellite-message">Satellite Message</Label>
                    <span className="text-xs text-muted-foreground">
                      {satelliteContent.length}/140 characters
                    </span>
                  </div>
                  <PromptInput
                    className="border-0"
                    onSubmit={handleSubmit}
                    globalDrop
                    multiple
                    accept="image/*"
                  >
                    <PromptInputBody>
                      <PromptInputAttachments>
                        {(attachment) => (
                          <PromptInputAttachment data={attachment} />
                        )}
                      </PromptInputAttachments>
                      <PromptInputTextarea
                        id="satellite-message"
                        placeholder="Shortened version for satellite transmission (max 140 characters)..."
                        onChange={(e) => setSatelliteContent(e.target.value)}
                        value={satelliteContent}
                        maxLength={140}
                      />
                    </PromptInputBody>
                    <PromptInputToolbar>
                      <PromptInputTools>
                        <PromptInputButton asChild>
                          <Popover modal={true}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Add satellite emoji"
                              >
                                <Smile className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">
                                  Add satellite emoji
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-0">
                              <EmojiPicker
                                className="h-[342px]"
                                locale="en"
                                onEmojiSelect={({ emoji }) => {
                                  addEmoji(emoji, "satellite");
                                }}
                              >
                                <EmojiPickerSearch />
                                <EmojiPickerContent />
                                <EmojiPickerFooter />
                              </EmojiPicker>
                            </PopoverContent>
                          </Popover>
                        </PromptInputButton>
                      </PromptInputTools>
                    </PromptInputToolbar>
                  </PromptInput>
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsSatelliteVersionOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Schedule Post
            </DialogTitle>
            <DialogDescription>
              Choose a date and time to publish your post automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="schedule-post" className="text-sm font-medium">
                  Schedule this post
                </Label>
                <p className="text-xs text-muted-foreground">
                  Toggle on to set a future publish date
                </p>
              </div>
              <Switch
                id="schedule-post"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
            </div>
            {isScheduled && (
              <div className="space-y-3 rounded-lg border p-4">
                <Label htmlFor="date-and-time">Date and Time</Label>
                <DateTimePickerPopover
                  date={scheduledDate}
                  setDate={setScheduledDate}
                  version="12"
                />
                <div className="space-y-1">
                  <Label>Timezone</Label>
                  <SearchableSelect
                    options={timezoneOptions}
                    value={selectedTimezone}
                    onChange={(timezone) =>
                      setSelectedTimezone(timezone || DEFAULT_TIMEZONE)
                    }
                  />
                </div>
                {scheduledDate && (
                  <p className="text-xs text-muted-foreground">
                    Your post will be published on{" "}
                    <span className="font-medium text-foreground">
                      {format(scheduledDate, "PPP")}
                    </span>{" "}
                    at{" "}
                    <span className="font-medium text-foreground">
                      {format(scheduledDate, "h:mm a")}
                    </span>{" "}
                    in{" "}
                    <span className="font-medium text-foreground">
                      {selectedTimezoneDetails}
                    </span>
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsScheduleOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Add Location
            </DialogTitle>
            <DialogDescription>
              Search for a location or click on the map to select a location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <LocationSearch
              onLocationSelect={(location) => {
                setSelectedLocation(location);
                // setIsLocationOpen(false);
              }}
              onLocationClear={() => {
                setSelectedLocation(null);
              }}
              selectedLocation={selectedLocation}
            />
            {isLocationOpen ? (
              <LocationPickerMap
                selectedLocation={selectedLocation}
                onLocationSelect={(location) => {
                  setSelectedLocation(location);
                }}
              />
            ) : null}
            {selectedLocation && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {selectedLocation.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedLocation.display_name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedLocation.lat.toFixed(6)},{" "}
                      {selectedLocation.lon.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsLocationOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CreatePostInput({ user }: { user: User }) {
  return (
    <AttachmentManager>
      <CreatePostComponent user={user} />
    </AttachmentManager>
  );
}

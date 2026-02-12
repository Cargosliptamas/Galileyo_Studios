"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { Calendar, ChevronDown, MapPin, Satellite, Smile } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
// import { LocationPickerMap } from "../map/location-picker-map";
import { LocationPickerMap } from "../map/location-picker-maplibre";
import { LocationSearch } from "../map/location-search";
import { DateTimePickerPopover } from "../ui/date-time-picker";
import { UserAvatar } from "./user-avatar";

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

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const activeProfile = useMemo(() => {
    return profiles.find((profile) => profile.id === selectedProfile);
  }, [profiles, selectedProfile]);

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
      const scheduledFor = isScheduled ? scheduledDate : undefined;

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

      formData.append(
        "schedule",
        scheduledFor ? scheduledFor.toISOString() : "",
      );
      formData.append("timezone", "UTC");
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

  const canPost = useMemo(() => {
    if (user.isInfluencer) {
      return true;
    }

    return ability.can("use", "can_post");
  }, [ability, user]);

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
            maxLength={512}
          >
            <div className="flex w-full items-center gap-2">
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
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label="Add photo(s)" />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton asChild>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
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
            <PromptInputButton asChild>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={useSatelliteVersion ? "primary" : "ghost"}
                      size="icon"
                      type="button"
                      onClick={() => setIsSatelliteVersionOpen(true)}
                    >
                      <Satellite
                        className={cn(
                          "h-4 w-4 text-muted-foreground",
                          useSatelliteVersion && "text-white",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Satellite version</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </PromptInputButton>
            <PromptInputButton asChild>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isScheduled ? "primary" : "ghost"}
                      size="icon"
                      type="button"
                      onClick={() => setIsScheduleOpen(true)}
                    >
                      <Calendar
                        className={cn(
                          "h-4 w-4 text-muted-foreground",
                          isScheduled && "text-white",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Schedule post</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </PromptInputButton>
            <PromptInputButton asChild>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedLocation ? "primary" : "ghost"}
                      size="icon"
                      type="button"
                      onClick={() => setIsLocationOpen(true)}
                    >
                      <MapPin
                        className={cn(
                          "h-4 w-4 text-muted-foreground",
                          selectedLocation && "text-white",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add location</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit
            disabled={!content || createPost.isPending}
            status={createPost.isPending ? "submitted" : undefined}
            size="md"
            additionalContent={
              <span className="text-xs text-muted-foreground">
                {content.length}/512
              </span>
            }
          />
        </PromptInputToolbar>
      </PromptInput>

      <Dialog
        open={isSatelliteVersionOpen}
        onOpenChange={setIsSatelliteVersionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <label
                className="flex items-center gap-2"
                htmlFor="satellite-version"
              >
                <Satellite className="h-4 w-4 text-muted-foreground" />
                Satellite Version
              </label>
              <Switch
                id="satellite-version"
                checked={useSatelliteVersion}
                onCheckedChange={setUseSatelliteVersion}
              />
              <span className="cursor-default rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                For satellite devices only
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {useSatelliteVersion && (
              <>
                <Label htmlFor="satellite-message">Satellite Message</Label>
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
                            <Button variant="ghost" size="icon">
                              <Smile className="h-4 w-4 text-muted-foreground" />
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <label
                className="flex items-center gap-2"
                htmlFor="schedule-post"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Schedule Post
              </label>
              <Switch
                id="schedule-post"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
              <span className="hidden rounded bg-muted px-2 py-1 text-xs text-muted-foreground md:block">
                Schedule your post for a later time
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {isScheduled && (
              <div className="flex flex-col gap-2 p-4">
                <Label htmlFor="date-and-time">Date and Time</Label>
                <DateTimePickerPopover
                  date={scheduledDate}
                  setDate={setScheduledDate}
                  version="12"
                />

                <span className="text-xs text-muted-foreground">
                  The post will be published on{" "}
                  {scheduledDate ? format(scheduledDate, "PPP hh:mm:ss a") : ""}
                </span>
              </div>
            )}
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
            <LocationPickerMap
              selectedLocation={selectedLocation}
              onLocationSelect={(location) => {
                setSelectedLocation(location);
              }}
            />
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

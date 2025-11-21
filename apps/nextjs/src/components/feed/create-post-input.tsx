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
import { Calendar, ChevronDown, Globe, Satellite, Smile } from "lucide-react";
import { v4 as uuid } from "uuid";

import type { PromptInputMessage } from "@galileyo/ui/ai-elements";
import type { FetchedArticle } from "@galileyo/validators/scraping";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Input,
  Label,
  ScrollArea,
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
import { Button } from "@galileyo/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@galileyo/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";
import { toast } from "@galileyo/ui/toast";

import type { User } from "~/auth/client";
import type { Profile } from "~/hooks/use-profiles";
import { env } from "~/env";
import { useProfiles } from "~/hooks/use-profiles";
import { getProfilePicture } from "~/lib/user";
import { useTRPC } from "~/trpc/react";
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
              {profiles.length > 1 ? (
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
    </div>
  );
}

function ScraperComponent() {
  const trpc = useTRPC();
  const [url, setUrl] = useState("");
  const [articles, setArticles] = useState<FetchedArticle[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set(),
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const createPost = useMutation(
    trpc.feed.createPost.mutationOptions({
      onSuccess: () => {
        // Success handled in the publishing function
      },
      onError: (error) => {
        toast.error(error.message || "Failed to publish articles");
      },
    }),
  );

  const scrape = useMutation(
    trpc.scraper.scrape.mutationOptions({
      onMutate: () => {
        setArticles([]);
        setSelectedArticles(new Set());
      },
      onSuccess: (data) => {
        console.log(data);
        setArticles(data);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to scrape");
      },
    }),
  );

  const handleSubmit = (url: string) => {
    scrape.mutate({ url });
  };

  const handleArticleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedArticles);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedArticles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map((article) => article.id)));
    }
  };

  const handlePublishSelected = async () => {
    const selected = articles.filter((article) =>
      selectedArticles.has(article.id),
    );
    if (selected.length === 0) {
      toast.error(
        "No articles selected. Please select at least one article to publish.",
      );
      return;
    }

    setIsPublishing(true);
    try {
      toast.success(`Publishing ${selected.length} selected article(s)...`);

      // Publish articles sequentially
      for (const article of selected) {
        const formData = new FormData();

        // Create post content from article
        const postContent = `${article.headline ?? "Untitled Article"}\n\n${article.articleBody ?? ""}\n\nSource: ${article.url}`;

        formData.append("text", postContent);
        formData.append("uuid", uuid());
        formData.append("subscriptions[]", ""); // Use default user feed
        formData.append("user_feed", "public"); // Make it public
        formData.append("schedule", "");
        formData.append("timezone", "UTC");
        formData.append("is_schedule", "0");

        // Add article image if available
        if (article.mainImage?.url) {
          try {
            // Fetch the image and convert to blob
            const imageResponse = await fetch(article.mainImage.url);
            const imageBlob = await imageResponse.blob();
            formData.append("files[]", imageBlob, "article-image.jpg");
          } catch (error) {
            console.warn("Failed to fetch article image:", error);
          }
        }

        // Create post using the existing createPost mutation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        createPost.mutate(formData as any);
      }

      toast.success(`Successfully published ${selected.length} article(s)!`);

      // Clear selection after successful publishing
      setSelectedArticles(new Set());
    } catch (error) {
      console.error("Error publishing articles:", error);
      toast.error("Failed to publish some articles. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full items-center gap-2 text-stone-900"
          style={{
            background:
              "linear-gradient(90deg, #ff005a, #ffb800, #00ff94, #01cfff, #a259ff, #ff005a)",
            backgroundSize: "200% 200%",
            animation: "rainbowBG 3s linear infinite",
          }}
        >
          <Globe className="h-4 w-4" />
          Scrape URL
          <style>
            {`
              @keyframes rainbowBG {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}
          </style>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
        <DialogHeader>
          <DialogTitle>Scrape URL</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Enter the URL of the website you want to scrape.
        </DialogDescription>
        <div className="flex flex-col gap-2">
          <div className="flex w-full flex-row gap-2">
            <Input
              placeholder="Enter URL to scrape"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <Button
              onClick={() => handleSubmit(url)}
              disabled={scrape.isPending}
            >
              {scrape.isPending ? "Scraping..." : "Scrape"}
            </Button>
          </div>

          {articles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedArticles.size === articles.length &&
                      articles.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium">
                    Select All ({selectedArticles.size}/{articles.length})
                  </Label>
                </div>
                {selectedArticles.size > 0 && (
                  <Button
                    onClick={handlePublishSelected}
                    size="sm"
                    className="ml-auto"
                    disabled={isPublishing}
                  >
                    {isPublishing
                      ? "Publishing..."
                      : `Publish Selected (${selectedArticles.size})`}
                  </Button>
                )}
              </div>

              <Separator />

              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-3 p-4">
                  {articles.map((article) => (
                    <Card
                      key={article.url}
                      className={cn(
                        "transition-all duration-200 hover:shadow-md",
                        selectedArticles.has(article.id) &&
                          "ring-2 ring-primary",
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`article-${article.url}`}
                            checked={selectedArticles.has(article.id)}
                            onCheckedChange={(checked) =>
                              handleArticleSelect(
                                article.id,
                                checked as boolean,
                              )
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <CardTitle className="text-lg leading-tight">
                              {article.headline ?? "Untitled Article"}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {article.datePublished && (
                                <Badge variant="outline">
                                  {article.datePublished}
                                </Badge>
                              )}
                              {article.inLanguage && (
                                <Badge variant="secondary">
                                  {article.inLanguage}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {article.mainImage?.url && (
                          <div className="mb-3">
                            <img
                              src={article.mainImage.url}
                              alt={article.headline ?? "Article image"}
                              className="h-48 w-full rounded-md object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        {article.articleBody && (
                          <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                            {article.articleBody}
                          </CardDescription>
                        )}

                        <div className="mt-3 border-t pt-3">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground transition-colors hover:text-primary"
                          >
                            View original article →
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CreatePostInput({ user }: { user: User }) {
  return (
    <AttachmentManager>
      <CreatePostComponent user={user} />
      {env.NEXT_PUBLIC_ZYTE_ENABLED && <ScraperComponent />}
    </AttachmentManager>
  );
}

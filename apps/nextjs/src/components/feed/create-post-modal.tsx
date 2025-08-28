"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format, setHours, setMinutes } from "date-fns";
import {
  Calendar,
  CalendarDays,
  Satellite,
  Smile,
  Trash2,
  Upload,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import { Calendar as CalendarComponent } from "@galileyo/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Label } from "@galileyo/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@galileyo/ui/select";
import { Switch } from "@galileyo/ui/switch";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";

import type { Profile } from "~/hooks/use-profiles";
import { ProfileSwitch } from "~/components/layout/profile-switch";
import { useProfiles } from "~/hooks/use-profiles";
import { useTRPC } from "~/trpc/react";

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  size: number;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreatePostData {
  content: string;
  satelliteContent?: string;
  media: MediaFile[];
  scheduledFor?: Date;
  isScheduled: boolean;
}

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [satelliteContent, setSatelliteContent] = useState("");
  const [useSatelliteVersion, setUseSatelliteVersion] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState("recent");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(
    addDays(new Date(), 1),
  );
  const [scheduledHour, setScheduledHour] = useState("09");
  const [scheduledMinute, setScheduledMinute] = useState("00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profiles, switchProfile } = useProfiles();

  // Emoji data organized by categories
  const emojiCategories = {
    recent: ["😀", "😂", "❤️", "👍", "🎉", "🚀", "🔥", "💡", "⚠️", "🌍"],
    faces: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
    ],
    emotions: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
    ],
    gestures: [
      "👍",
      "👎",
      "👌",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
    ],
    objects: [
      "📱",
      "💻",
      "⌨️",
      "🖥️",
      "🖨️",
      "🖱️",
      "🖲️",
      "💽",
      "💾",
      "💿",
      "📀",
      "🎥",
      "📺",
      "📻",
      "📷",
      "📹",
      "📼",
      "🔋",
      "🔌",
      "💡",
    ],
    nature: [
      "🌍",
      "🌎",
      "🌏",
      "🌐",
      "🌑",
      "🌒",
      "🌓",
      "🌔",
      "🌕",
      "🌖",
      "🌗",
      "🌘",
      "🌙",
      "🌚",
      "🌛",
      "🌜",
      "🌡️",
      "☀️",
      "🌤️",
      "⛅",
    ],
    activities: [
      "🎉",
      "🎊",
      "🎈",
      "🎂",
      "🎁",
      "🎄",
      "🎃",
      "🎗️",
      "🎟️",
      "🎫",
      "🎖️",
      "🏆",
      "🏅",
      "🥇",
      "🥈",
      "🥉",
      "⚽",
      "🏀",
      "🏈",
      "⚾",
    ],
    transport: [
      "🚀",
      "🚁",
      "🚂",
      "🚃",
      "🚄",
      "🚅",
      "🚆",
      "🚇",
      "🚈",
      "🚉",
      "🚊",
      "🚋",
      "🚌",
      "🚍",
      "🚎",
      "🚐",
      "🚑",
      "🚒",
      "🚓",
      "🚔",
    ],
    symbols: [
      "✨",
      "💫",
      "⭐",
      "🌟",
      "💥",
      "🔥",
      "💦",
      "💨",
      "💢",
      "💬",
      "💭",
      "💤",
      "💋",
      "💯",
      "💢",
      "💥",
      "💫",
      "💦",
      "💨",
      "💢",
    ],
    flags: [
      "🚨",
      "⚠️",
      "⚡",
      "🛰️",
      "📡",
      "🔔",
      "💡",
      "🔥",
      "🚀",
      "💪",
      "✨",
      "🌟",
      "🎯",
      "📢",
      "🔴",
      "🟡",
      "🟢",
      "🔵",
      "🟣",
      "⚫",
    ],
  };

  const addEmoji = (emoji: string, target: "content" | "satellite") => {
    if (target === "content") {
      setContent((prev) => prev + emoji);
    } else {
      setSatelliteContent((prev) => prev + emoji);
    }
  };

  const createPost = useMutation(
    trpc.feed.createPost.mutationOptions({
      onSuccess: async () => {
        toast.success("Post created successfully");

        // Reset form
        setContent("");
        setSatelliteContent("");
        setUseSatelliteVersion(false);
        setActiveEmojiCategory("recent");
        setMedia([]);
        setIsScheduled(false);
        setScheduledDate(addDays(new Date(), 1));
        setScheduledHour("09");
        setScheduledMinute("00");

        onClose();

        await queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update profile");
      },
    }),
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newMedia: MediaFile[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "video",
      size: file.size,
    }));

    setMedia((prev) => [...prev, ...newMedia]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const fileToRemove = prev.find((m) => m.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = () => {
    if (!content.trim() && media.length === 0) return;

    setIsSubmitting(true);
    try {
      const postData: CreatePostData = {
        content: content.trim(),
        satelliteContent: satelliteContent.trim() || undefined,
        media,
        isScheduled,
        scheduledFor: isScheduled
          ? setMinutes(
              setHours(scheduledDate, parseInt(scheduledHour)),
              parseInt(scheduledMinute),
            )
          : undefined,
      };

      const activeProfile = profiles[0]?.id;

      createPost.mutate({
        content: postData.content,
        satelliteContent: useSatelliteVersion
          ? postData.satelliteContent
          : undefined,
        media: postData.media.map((m) => m.file),
        isScheduled: postData.isScheduled,
        scheduledFor: postData.scheduledFor,
        profileId: activeProfile,
      });
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    // Clean up media previews
    media.forEach((m) => URL.revokeObjectURL(m.preview));

    // Reset form
    setContent("");
    setSatelliteContent("");
    setUseSatelliteVersion(false);
    setActiveEmojiCategory("recent");
    setMedia([]);
    setIsScheduled(false);
    setScheduledDate(addDays(new Date(), 1));
    setScheduledHour("09");
    setScheduledMinute("00");

    onClose();
  };

  const canSubmit =
    (content.trim().length > 0 || media.length > 0) && !isSubmitting;

  const handleProfileSwitch = (profile: Profile) => {
    try {
      switchProfile(profile.id);
      console.log("Profile switched to:", profile);
    } catch (error) {
      console.error("Failed to switch profile:", error);
    }
  };

  const handleQuickProfileSwitch = (profileId: string) => {
    try {
      switchProfile(profileId);
    } catch (error) {
      console.error("Failed to switch profile:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Display and Switching */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Posting as:
            </Label>

            {/* Quick Profile Selector */}
            {profiles.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Quick switch:
                </span>
                <div className="flex gap-1">
                  {profiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant={profile.isActive ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleQuickProfileSwitch(profile.id)}
                      className="h-8 px-3 text-xs"
                    >
                      <Avatar className="mr-1 h-5 w-5">
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback>
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {profile.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <ProfileSwitch
              onProfileSwitch={handleProfileSwitch}
              showCreateButton={true}
              className="w-full"
              compact={true}
            />
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="post-content">What's on your mind?</Label>

            {/* Emoji Selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
                <Smile className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Add emoji:
                </span>

                {/* Quick Emoji Picker */}
                <div className="flex flex-wrap gap-1">
                  {emojiCategories.recent.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji, "content")}
                      className="rounded p-1 text-lg transition-colors hover:bg-muted"
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Full Emoji Picker Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="ml-auto text-sm text-primary hover:underline"
                    >
                      More emojis
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-96 w-80 p-0" align="end">
                    <div className="space-y-3 p-3">
                      {/* Category Tabs */}
                      <div className="relative">
                        <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex gap-1 overflow-x-auto pb-2">
                          {Object.keys(emojiCategories).map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => setActiveEmojiCategory(category)}
                              className={cn(
                                "flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors",
                                activeEmojiCategory === category
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80",
                              )}
                            >
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </button>
                          ))}
                        </div>
                        {/* Scroll indicator */}
                        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-4 bg-gradient-to-l from-white to-transparent dark:from-slate-900" />
                      </div>

                      {/* Emoji Grid */}
                      <div className="relative">
                        <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
                          {emojiCategories[
                            activeEmojiCategory as keyof typeof emojiCategories
                          ].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => addEmoji(emoji, "content")}
                              className="rounded p-1 text-lg transition-colors hover:bg-muted"
                              title={`Add ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        {/* Scroll indicator for emoji grid */}
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent dark:from-slate-900" />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Textarea
              id="post-content"
              placeholder="Share your thoughts, news, or updates..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={512}
            />
            <div className="text-right text-sm text-muted-foreground">
              {content.length}/512
            </div>
          </div>

          {/* Satellite Version Switch */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Satellite className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="satellite-version">Satellite Version</Label>
              <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                For satellite devices only
              </span>
            </div>
            <div className="flex items-center gap-2">
              {useSatelliteVersion && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                  Enabled
                </span>
              )}
              <Switch
                id="satellite-version"
                checked={useSatelliteVersion}
                onCheckedChange={setUseSatelliteVersion}
              />
            </div>
          </div>

          {/* Satellite Content Input */}
          {useSatelliteVersion && (
            <div className="space-y-3 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="satellite-content"
                  className="text-sm font-medium"
                >
                  Satellite Message
                </Label>
              </div>

              {/* Satellite Emoji Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
                  <Smile className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Add emoji:
                  </span>

                  {/* Quick Satellite Emoji Picker */}
                  <div className="flex flex-wrap gap-1">
                    {emojiCategories.flags.slice(0, 8).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji, "satellite")}
                        className="rounded p-1 text-sm transition-colors hover:bg-muted"
                        title={`Add ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Full Satellite Emoji Picker Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="ml-auto text-xs text-primary hover:underline"
                      >
                        More
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-80 w-64 p-0" align="start">
                      <div className="space-y-3 p-3">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">
                          Emergency & Alert Emojis
                        </div>
                        <div className="relative">
                          <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent grid max-h-48 grid-cols-6 gap-1 overflow-y-auto">
                            {emojiCategories.flags.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => addEmoji(emoji, "satellite")}
                                className="rounded p-1 text-base transition-colors hover:bg-muted"
                                title={`Add ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                          {/* Scroll indicator for satellite emoji grid */}
                          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent dark:from-slate-900" />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Textarea
                id="satellite-content"
                placeholder="Shortened version for satellite transmission (max 140 characters)..."
                value={satelliteContent}
                onChange={(e) => setSatelliteContent(e.target.value)}
                className="min-h-[80px] resize-none text-sm"
                maxLength={140}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>This version will be sent to satellite devices</span>
                <span>{satelliteContent.length}/140</span>
              </div>
              <div className="rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Use this for emergency alerts, critical
                updates, or when you need to reach users with limited
                connectivity. The satellite version will be transmitted to
                devices that can only receive short messages.
              </div>
            </div>
          )}

          {/* Media Upload */}
          <div className="space-y-3">
            <Label>Attach Media</Label>
            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop files here..."
                  : "Drag & drop images/videos here, or click to select"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports: JPG, PNG, GIF, WebP, MP4, MOV, AVI, WebM (max 50MB
                each)
              </p>
            </div>
          </div>

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="space-y-3">
              <Label>Attached Media ({media.length})</Label>
              <div className="grid grid-cols-2 gap-3">
                {media.map((file) => (
                  <div key={file.id} className="group relative">
                    {file.type === "image" ? (
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <video
                        src={file.preview}
                        className="h-32 w-full rounded-lg object-cover"
                        muted
                        onMouseEnter={(e) =>
                          (e.target as HTMLVideoElement).play()
                        }
                        onMouseLeave={(e) =>
                          (e.target as HTMLVideoElement).pause()
                        }
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMedia(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduling Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule-post">Schedule Post</Label>
              <Switch
                id="schedule-post"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
            </div>

            {isScheduled && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(scheduledDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={scheduledDate}
                          onSelect={(date) => date && setScheduledDate(date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Picker */}
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <div className="flex gap-2">
                      <Select
                        value={scheduledHour}
                        onValueChange={setScheduledHour}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="flex items-center">:</span>
                      <Select
                        value={scheduledMinute}
                        onValueChange={setScheduledMinute}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Post will be published on{" "}
                  <span className="font-medium">
                    {format(
                      setMinutes(
                        setHours(scheduledDate, parseInt(scheduledHour)),
                        parseInt(scheduledMinute),
                      ),
                      "PPP 'at' h:mm a",
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1"
            >
              {isSubmitting
                ? "Creating..."
                : isScheduled
                  ? "Schedule Post"
                  : "Create Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

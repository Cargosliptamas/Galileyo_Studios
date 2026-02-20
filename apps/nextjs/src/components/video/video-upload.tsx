"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Globe,
  ImagePlus,
  Loader2,
  Lock,
  Pencil,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { useIsMobile } from "@galileyo/ui/hooks";
import { Label } from "@galileyo/ui/label";
import { Progress } from "@galileyo/ui/progress";
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

import { authClient } from "~/auth/client";
import { useProfiles } from "~/hooks/use-profiles";
import { useVideoUpload } from "~/hooks/use-video-upload";
import { formatFileSize } from "~/lib/format";

interface VideoUploadProps {
  onUploadComplete?: (videoId: number) => void;
  onEditBeforeUpload?: (file: File) => void;
  onCancel?: () => void;
  caption?: string;
  subscriptionId?: number;
  className?: string;
  showEditOption?: boolean;
  initialFile?: File | null;
}

type UploadStep = "select" | "details" | "uploading";

async function waitForVideoEvent(
  videoElement: HTMLVideoElement,
  eventName: "loadedmetadata" | "loadeddata" | "seeked",
  timeoutMs = 10000,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const onEvent = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    const timeoutId = window.setTimeout(() => {
      videoElement.removeEventListener(eventName, onEvent);
      reject(new Error(`Timed out waiting for ${eventName}`));
    }, timeoutMs);

    videoElement.addEventListener(eventName, onEvent, { once: true });
  });
}

async function waitForDecodedFrame(
  videoElement: HTMLVideoElement,
): Promise<void> {
  const withFrameCallback = videoElement as HTMLVideoElement & {
    requestVideoFrameCallback?: (
      callback: (now: number, metadata: unknown) => void,
    ) => number;
  };

  if (typeof withFrameCallback.requestVideoFrameCallback === "function") {
    await new Promise<void>((resolve) => {
      withFrameCallback.requestVideoFrameCallback(() => resolve());
    });
    return;
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function seekVideo(videoElement: HTMLVideoElement, time: number) {
  if (!Number.isFinite(time) || time < 0) return;

  if (
    Math.abs(videoElement.currentTime - time) < 0.01 &&
    videoElement.readyState >= 2
  ) {
    return;
  }

  const seekPromise = waitForVideoEvent(videoElement, "seeked");
  videoElement.currentTime = time;
  await seekPromise;
}

function isCanvasMostlyBlack(canvas: HTMLCanvasElement): boolean {
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = 32;
  sampleCanvas.height = 32;
  const sampleContext = sampleCanvas.getContext("2d");

  if (!sampleContext) return false;

  sampleContext.drawImage(canvas, 0, 0, 32, 32);
  const imageData = sampleContext.getImageData(0, 0, 32, 32).data;

  let darkPixelCount = 0;
  const pixelCount = imageData.length / 4;

  for (let index = 0; index < imageData.length; index += 4) {
    const red = imageData[index] ?? 0;
    const green = imageData[index + 1] ?? 0;
    const blue = imageData[index + 2] ?? 0;
    if (red + green + blue < 45) {
      darkPixelCount += 1;
    }
  }

  return darkPixelCount / pixelCount > 0.98;
}

async function createThumbnailFromFirstFrame(file: File): Promise<File> {
  const MAX_THUMBNAIL_DIMENSION = 1080;
  const sourceUrl = URL.createObjectURL(file);
  const videoElement = document.createElement("video");
  videoElement.preload = "auto";
  videoElement.muted = true;
  videoElement.playsInline = true;

  try {
    videoElement.src = sourceUrl;
    videoElement.load();
    await waitForVideoEvent(videoElement, "loadedmetadata");

    if (videoElement.readyState < 2) {
      try {
        await waitForVideoEvent(videoElement, "loadeddata", 5000);
      } catch {
        // Some browsers skip loadeddata for blob URLs; we'll still attempt capture.
      }
    }

    const width = Math.max(videoElement.videoWidth, 1);
    const height = Math.max(videoElement.videoHeight, 1);
    const scale = Math.min(
      1,
      MAX_THUMBNAIL_DIMENSION / Math.max(width, height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to initialize thumbnail canvas");
    }

    const duration =
      Number.isFinite(videoElement.duration) && videoElement.duration > 0
        ? videoElement.duration
        : null;

    const candidateTimes = duration
      ? [0, 0.08, 0.2, 0.4, 0.8, Math.min(duration * 0.1, 1.5)]
      : [0, 0.08, 0.2, 0.4];

    const seekTargets = [
      ...new Set(
        candidateTimes
          .map((time) =>
            duration
              ? Math.min(Math.max(time, 0.01), Math.max(duration - 0.01, 0.01))
              : time,
          )
          .filter((time) => Number.isFinite(time) && time >= 0),
      ),
    ];

    let hasNonBlackFrame = false;
    let hasCapturedFrame = false;

    for (const time of seekTargets) {
      try {
        await seekVideo(videoElement, time);
        await waitForDecodedFrame(videoElement);
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        hasCapturedFrame = true;
      } catch {
        continue;
      }

      if (!isCanvasMostlyBlack(canvas)) {
        hasNonBlackFrame = true;
        break;
      }
    }

    if (!hasCapturedFrame) {
      throw new Error("Failed to capture thumbnail frame");
    }

    if (!hasNonBlackFrame) {
      // Fall back to the latest captured frame even if it's dark.
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }

    const thumbnailBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.85);
    });

    if (!thumbnailBlob) {
      throw new Error("Failed to create thumbnail image");
    }

    const fileNameWithoutExtension = file.name.replace(/\.[^.]+$/, "");
    return new File(
      [thumbnailBlob],
      `${fileNameWithoutExtension || "video"}-thumbnail.jpg`,
      {
        type: "image/jpeg",
      },
    );
  } finally {
    URL.revokeObjectURL(sourceUrl);
    videoElement.pause();
    videoElement.removeAttribute("src");
    videoElement.load();
  }
}

async function createThumbnailFromVideoElement(
  videoElement: HTMLVideoElement,
  fileName: string,
  captureTime?: number,
): Promise<File> {
  const MAX_THUMBNAIL_DIMENSION = 1080;

  if (videoElement.readyState < 2) {
    await waitForVideoEvent(videoElement, "loadeddata", 5000);
  }

  if (videoElement.seeking) {
    await waitForVideoEvent(videoElement, "seeked", 5000);
  }

  if (Number.isFinite(captureTime) && (captureTime ?? 0) >= 0) {
    await seekVideo(videoElement, captureTime ?? 0);
  }

  const width = Math.max(videoElement.videoWidth, 1);
  const height = Math.max(videoElement.videoHeight, 1);
  const scale = Math.min(1, MAX_THUMBNAIL_DIMENSION / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to initialize thumbnail canvas");
  }

  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  const thumbnailBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.85);
  });

  if (!thumbnailBlob) {
    throw new Error("Failed to create thumbnail image");
  }

  const fileNameWithoutExtension = fileName.replace(/\.[^.]+$/, "");
  return new File(
    [thumbnailBlob],
    `${fileNameWithoutExtension || "video"}-thumbnail.jpg`,
    {
      type: "image/jpeg",
    },
  );
}

export function VideoUpload({
  onUploadComplete,
  onEditBeforeUpload,
  onCancel,
  caption: initialCaption,
  subscriptionId: initialSubscriptionId,
  className,
  showEditOption = false,
  initialFile = null,
}: VideoUploadProps) {
  const isMobile = useIsMobile();
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null,
  );
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isCapturingCurrentFrame, setIsCapturingCurrentFrame] = useState(false);
  const [step, setStep] = useState<UploadStep>(
    initialFile ? "details" : "select",
  );
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const thumbnailGenerationRef = useRef(0);

  // Feed selection state
  const [captionText, setCaptionText] = useState(initialCaption ?? "");
  const [userFeed, setUserFeed] = useState<"public" | "friends">("public");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<
    number | undefined
  >(initialSubscriptionId);
  const [allowSharing, setAllowSharing] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

  const { data: session } = authClient.useSession();
  const isInfluencer = session?.user ? session.user.isInfluencer : false;
  const { profiles } = useProfiles();

  // Filter to influencer profiles (ones with subscription IDs)
  const influencerProfiles = useMemo(
    () =>
      profiles.filter(
        (p) => p.role === "influencer" || p.role === "follower_list",
      ),
    [profiles],
  );

  const generateAutoThumbnail = useCallback(async (file: File) => {
    const generationId = ++thumbnailGenerationRef.current;
    setIsGeneratingThumbnail(true);

    try {
      const generatedThumbnail = await createThumbnailFromFirstFrame(file);
      if (thumbnailGenerationRef.current !== generationId) {
        return;
      }
      setThumbnailFile(generatedThumbnail);
    } catch {
      if (thumbnailGenerationRef.current !== generationId) {
        return;
      }
      setThumbnailFile(null);
      toast.info("Auto-thumbnail failed. You can select a custom thumbnail.");
    } finally {
      if (thumbnailGenerationRef.current === generationId) {
        setIsGeneratingThumbnail(false);
      }
    }
  }, []);

  // Handle initial file
  useEffect(() => {
    if (initialFile && !previewUrl) {
      setSelectedFile(initialFile);
      setPreviewUrl(URL.createObjectURL(initialFile));
      setStep("details");
      void generateAutoThumbnail(initialFile);
    }
  }, [generateAutoThumbnail, initialFile, previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [thumbnailFile]);

  const {
    progress,
    error,
    thumbnailUrl,
    upload,
    reset,
    cancel,
    isUploading,
    isProcessing,
    isReady,
    isError,
  } = useVideoUpload({
    onSuccess: (videoId) => {
      toast.success("Video uploaded successfully!");
      onUploadComplete?.(videoId);
    },
    onError: () => {
      toast.error("We couldn't upload your video. Please try again.");
    },
  });

  const handleFileSelected = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file must be less than 500MB");
        return;
      }

      thumbnailGenerationRef.current += 1;
      setIsGeneratingThumbnail(false);
      setIsCapturingCurrentFrame(false);
      setSelectedFile(file);
      setThumbnailFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setStep("details");
      void generateAutoThumbnail(file);
    },
    [generateAutoThumbnail, previewUrl],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "video/*": [] },
    maxSize: 500 * 1024 * 1024,
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorMessage = rejection?.errors[0]?.message ?? "Invalid file";
        toast.error(errorMessage);
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        handleFileSelected(file);
      }
    },
  });

  const openNativeInputPicker = useCallback(
    (input: HTMLInputElement | null) => {
      if (!input) return;

      if (typeof input.showPicker === "function") {
        try {
          input.showPicker();
          return;
        } catch {
          // Fall back to click() when showPicker is unsupported or blocked.
        }
      }

      input.click();
    },
    [],
  );

  const handleNativeVideoFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (file) {
        handleFileSelected(file);
      }
    },
    [handleFileSelected],
  );

  const handleThumbnailSelectClick = useCallback(() => {
    thumbnailInputRef.current?.click();
  }, []);

  const handleThumbnailFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Thumbnail image must be less than 10MB");
        return;
      }

      thumbnailGenerationRef.current += 1;
      setIsGeneratingThumbnail(false);
      setIsCapturingCurrentFrame(false);
      setThumbnailFile(file);
    },
    [],
  );

  const handleRegenerateThumbnail = useCallback(() => {
    if (!selectedFile) return;
    void generateAutoThumbnail(selectedFile);
  }, [generateAutoThumbnail, selectedFile]);

  const handleUseCurrentFrame = useCallback(async () => {
    const previewVideo = previewVideoRef.current;
    if (!selectedFile || !previewVideo) return;
    const captureTime = previewVideo.currentTime;

    const generationId = ++thumbnailGenerationRef.current;
    setIsGeneratingThumbnail(false);
    setIsCapturingCurrentFrame(true);

    try {
      const capturedThumbnail = await createThumbnailFromVideoElement(
        previewVideo,
        selectedFile.name,
        captureTime,
      );

      if (thumbnailGenerationRef.current !== generationId) {
        return;
      }

      setThumbnailFile(capturedThumbnail);
    } catch {
      if (thumbnailGenerationRef.current !== generationId) {
        return;
      }
      toast.error(
        "Couldn't capture the current frame. Try a different moment.",
      );
    } finally {
      if (thumbnailGenerationRef.current === generationId) {
        setIsCapturingCurrentFrame(false);
      }
    }
  }, [selectedFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setStep("uploading");
    await upload(selectedFile, {
      caption: captionText || undefined,
      subscriptionId: selectedSubscriptionId,
      thumbnailFile,
    });
  }, [
    captionText,
    selectedFile,
    selectedSubscriptionId,
    thumbnailFile,
    upload,
  ]);

  const handleCancel = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    thumbnailGenerationRef.current += 1;
    setIsGeneratingThumbnail(false);
    setIsCapturingCurrentFrame(false);
    if (isUploading || isProcessing) {
      cancel();
      toast.info("Upload canceled");
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setCaptionText("");
    setStep("select");
    reset();
    onCancel?.();
  }, [cancel, isProcessing, isUploading, previewUrl, reset, onCancel]);

  const handleSelectClick = useCallback(() => {
    openNativeInputPicker(videoInputRef.current);
  }, [openNativeInputPicker]);

  const handleCameraSelectClick = useCallback(() => {
    openNativeInputPicker(cameraVideoInputRef.current);
  }, [openNativeInputPicker]);

  const handleEditBeforeUpload = useCallback(() => {
    if (selectedFile) {
      onEditBeforeUpload?.(selectedFile);
    }
  }, [selectedFile, onEditBeforeUpload]);

  const statusLabel = useMemo(() => {
    if (isUploading) return "Uploading video";
    if (isProcessing) return "Preparing video";
    if (isReady) return "Upload complete";
    if (isError) return "Upload failed";
    return "Ready to upload";
  }, [isError, isProcessing, isReady, isUploading]);

  const statusMessage = useMemo(() => {
    if (isUploading) return `Uploading ${progress.overall}%`;
    if (isProcessing) return "Finalizing your video for playback.";
    if (isReady) return "Your video is ready.";
    if (isError) return "Please try again.";
    return selectedFile
      ? "Review details and publish when you're ready."
      : "Select a video to continue.";
  }, [
    isError,
    isProcessing,
    isReady,
    isUploading,
    progress.overall,
    selectedFile,
  ]);

  const userFacingError = useMemo(() => {
    const normalizedError = error?.toLowerCase() ?? "";
    if (normalizedError.includes("cancel")) return "Upload canceled.";
    if (normalizedError.includes("time")) {
      return "This is taking longer than expected. Please try again.";
    }
    return "We couldn't upload your video. Please try again.";
  }, [error]);

  return (
    <div className={cn("min-w-0 space-y-4", className)}>
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleNativeVideoFileChange}
      />
      <input
        ref={cameraVideoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleNativeVideoFileChange}
      />

      {/* Step 1: Select Video */}
      {step === "select" && (
        <div
          {...getRootProps({
            className:
              "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors hover:border-cyan-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-cyan-500 dark:hover:bg-slate-700",
          })}
        >
          <input {...getInputProps()} />
          <div className="rounded-full bg-cyan-500/10 p-4">
            <Video className="h-8 w-8 text-cyan-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isDragActive ? "Drop your video here" : "Drag & drop a video"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              MP4, WebM, MOV up to 500MB
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={handleSelectClick}>
              Select file
            </Button>
            {isMobile && (
              <Button variant="ghost" onClick={handleCameraSelectClick}>
                Use camera
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Details and Publish */}
      {step === "details" && selectedFile && previewUrl && (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          {/* Video Preview */}
          <div className="space-y-3">
            <div className="relative aspect-[9/16] max-h-[360px] overflow-hidden rounded-2xl bg-black">
              <video
                ref={previewVideoRef}
                src={previewUrl}
                className="h-full w-full object-contain"
                controls
                muted
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => {
                  thumbnailGenerationRef.current += 1;
                  setIsGeneratingThumbnail(false);
                  setStep("select");
                  setSelectedFile(null);
                  setThumbnailFile(null);
                  setThumbnailPreviewUrl(null);
                  setIsCapturingCurrentFrame(false);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                aria-label="Remove video"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex min-w-0 items-center justify-between text-xs text-slate-500">
              <span className="truncate pr-2" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span>{formatFileSize(selectedFile.size)}</span>
            </div>
          </div>

          {/* Details Form */}
          <div className="space-y-5">
            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium">
                Caption
              </Label>
              <Textarea
                id="caption"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Write a caption... Use #hashtags and @mentions"
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-right text-xs text-slate-400">
                {captionText.length}/500
              </p>
            </div>

            {/* Thumbnail */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Thumbnail</Label>
                {isGeneratingThumbnail && (
                  <span className="text-xs text-slate-500">
                    Generating from first frame...
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="aspect-[9/16] w-20 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                  {thumbnailPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">
                      No preview
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Auto-generated from the first frame. You can replace it.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleThumbnailSelectClick}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Change thumbnail
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRegenerateThumbnail}
                      disabled={isCapturingCurrentFrame}
                    >
                      Use first frame
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleUseCurrentFrame}
                      disabled={isCapturingCurrentFrame}
                    >
                      {isCapturingCurrentFrame
                        ? "Capturing frame..."
                        : "Use current frame"}
                    </Button>
                  </div>
                </div>
              </div>

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleThumbnailFileChange}
              />
            </div>

            {/* Feed Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Post to</Label>
              {isInfluencer && influencerProfiles.length > 0 ? (
                <Select
                  value={
                    selectedSubscriptionId
                      ? String(selectedSubscriptionId)
                      : userFeed
                  }
                  onValueChange={(value) => {
                    if (value === "public" || value === "friends") {
                      setUserFeed(value);
                      setSelectedSubscriptionId(undefined);
                    } else {
                      setSelectedSubscriptionId(Number(value));
                      setUserFeed("public");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose feed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public Feed
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Friends Only
                      </div>
                    </SelectItem>
                    {influencerProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={String(profile.id)}>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          {profile.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={userFeed}
                  onValueChange={(value) =>
                    setUserFeed(value as "public" | "friends")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public Feed
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Friends Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Privacy Toggles */}
            <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Privacy Settings
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="allow-comments"
                    className="text-sm text-slate-600 dark:text-slate-400"
                  >
                    Allow comments
                  </Label>
                  <Switch
                    id="allow-comments"
                    checked={allowComments}
                    onCheckedChange={setAllowComments}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="allow-sharing"
                    className="text-sm text-slate-600 dark:text-slate-400"
                  >
                    Allow sharing
                  </Label>
                  <Switch
                    id="allow-sharing"
                    checked={allowSharing}
                    onCheckedChange={setAllowSharing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="allow-duet"
                    className="text-sm text-slate-600 dark:text-slate-400"
                  >
                    Allow duets
                  </Label>
                  <Switch
                    id="allow-duet"
                    checked={allowDuet}
                    onCheckedChange={setAllowDuet}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="allow-stitch"
                    className="text-sm text-slate-600 dark:text-slate-400"
                  >
                    Allow stitches
                  </Label>
                  <Switch
                    id="allow-stitch"
                    checked={allowStitch}
                    onCheckedChange={setAllowStitch}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {showEditOption && onEditBeforeUpload && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEditBeforeUpload}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Before Upload
                </Button>
              )}
              <Button className="w-full" onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Publish Video
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Uploading/Processing */}
      {step === "uploading" && selectedFile && previewUrl && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative aspect-[9/16] max-h-[480px] overflow-hidden rounded-2xl bg-black">
            {isReady && thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="h-full w-full object-contain"
              />
            ) : (
              <video
                src={previewUrl}
                className="h-full w-full object-contain"
                muted
              />
            )}

            {(isUploading || isProcessing) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="mt-2 text-sm font-medium text-white">
                  {isUploading ? "Uploading video..." : "Preparing video..."}
                </p>
              </div>
            )}

            {isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-2 text-sm font-medium text-white">
                  Video is ready!
                </p>
              </div>
            )}

            {isError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="mt-2 text-sm font-medium text-white">
                  {userFacingError}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {statusLabel}
                  </p>
                  <p
                    className="truncate text-xs text-slate-500 dark:text-slate-400"
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {statusMessage}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>

              {(isUploading || isProcessing) && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      {isUploading
                        ? `Uploading ${progress.overall}%`
                        : "Preparing your video..."}
                    </span>
                  </div>
                  <Progress
                    value={isUploading ? progress.overall : undefined}
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isUploading
                      ? "Keep this window open until upload is complete."
                      : "This can take up to a minute."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {(isUploading || isProcessing) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel upload
                </Button>
              )}

              {isReady && (
                <Button className="w-full" onClick={handleCancel}>
                  Done
                </Button>
              )}

              {isError && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep("details")}
                  >
                    Back to details
                  </Button>
                  <Button className="w-full" onClick={handleUpload}>
                    Retry upload
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

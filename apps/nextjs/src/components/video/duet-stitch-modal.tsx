"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  GitBranch,
  Heart,
  Layers,
  Loader2,
  MessageCircle,
  Play,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Progress } from "@galileyo/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";
import { toast } from "@galileyo/ui/toast";

import { useVideoUpload } from "~/hooks/use-video-upload";
import { formatCount } from "~/lib/format";
import { getVideoThumbnailProxyUrl } from "~/lib/video-proxy";
import { useTRPC } from "~/trpc/react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DuetStitchModalProps {
  videoId: number;
  videoThumbnailUrl?: string | null;
  creatorName: string;
  creatorImage?: string | null;
  allowDuet?: boolean;
  allowStitch?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalStep = "select" | "upload" | "uploading" | "success";

// ─── Component ───────────────────────────────────────────────────────────────

export function DuetStitchModal({
  videoId,
  videoThumbnailUrl,
  creatorName,
  creatorImage,
  allowDuet = true,
  allowStitch = true,
  open,
  onOpenChange,
}: DuetStitchModalProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const originalThumbnailProxyUrl = getVideoThumbnailProxyUrl(
    videoId,
    videoThumbnailUrl,
  );

  // ── Local state ──────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState<"duet" | "stitch" | null>(
    null,
  );
  const [step, setStep] = useState<ModalStep>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newVideoId, setNewVideoId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "browse">("create");
  const [browseFilter, setBrowseFilter] = useState<"all" | "duet" | "stitch">(
    "all",
  );

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: countsData } = useQuery({
    ...trpc.video.getDuetStitchCounts.queryOptions({ videoId }),
    enabled: open,
  });

  // ── Upload hook ──────────────────────────────────────────────────────────

  const {
    progress,
    error: uploadError,
    upload,
    reset: resetUpload,
    cancel: cancelUpload,
    isUploading,
    isProcessing,
    isReady,
    isError: isUploadError,
    muxEnabled,
  } = useVideoUpload({
    onSuccess: (vid) => {
      setNewVideoId(vid);
    },
    onError: (err) => {
      toast.error(err);
    },
  });

  // ── Create duet/stitch mutation ──────────────────────────────────────────

  const createDuetStitchMutation = useMutation(
    trpc.video.createDuetStitch.mutationOptions({
      onSuccess: () => {
        setStep("success");
        void queryClient.invalidateQueries(
          trpc.video.getDuetStitchCounts.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.video.getDuetsStitches.pathFilter(),
        );
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
      },
      onError: (error: { message?: string }) => {
        toast.error(error.message ?? "Failed to create duet/stitch link");
      },
    }),
  );
  const {
    mutate: createDuetStitch,
    isPending: isCreatingDuetStitch,
    isSuccess: isDuetStitchSuccess,
  } = createDuetStitchMutation;

  // When upload finishes, automatically call createDuetStitch
  useEffect(() => {
    if (
      newVideoId &&
      selectedType &&
      isReady &&
      !isCreatingDuetStitch &&
      !isDuetStitchSuccess
    ) {
      createDuetStitch({
        videoId: newVideoId,
        originalVideoId: videoId,
        type: selectedType,
      });
    }
  }, [
    createDuetStitch,
    isCreatingDuetStitch,
    isDuetStitchSuccess,
    isReady,
    newVideoId,
    selectedType,
    videoId,
  ]);

  // ── Browse query ─────────────────────────────────────────────────────────

  const browseQueryOptions = trpc.video.getDuetsStitches.infiniteQueryOptions({
    videoId,
    type: browseFilter,
    limit: 12,
  });

  const {
    data: browseData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isBrowseLoading,
  } = useInfiniteQuery({
    ...browseQueryOptions,
    enabled: open && activeTab === "browse",
    getNextPageParam: (lastPage: { nextCursor: number | null }) =>
      lastPage.nextCursor ?? null,
    initialPageParam: null as number | null,
  });

  const browseItems = useMemo(
    () =>
      (browseData?.pages as { items: BrowseItem[] }[] | undefined)?.flatMap(
        (page) => page.items,
      ) ?? [],
    [browseData],
  );

  // ── Dropzone ─────────────────────────────────────────────────────────────

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
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [previewUrl],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone({
    accept: { "video/*": [] },
    maxSize: 500 * 1024 * 1024,
    multiple: false,
    noClick: true,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        const firstError = rejected[0]?.errors[0];
        toast.error(firstError?.message ?? "Invalid file");
        return;
      }
      if (accepted[0]) handleFileSelected(accepted[0]);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleContinueToUpload = () => {
    if (!selectedType) return;
    setStep("upload");
  };

  const handleStartUpload = useCallback(async () => {
    if (!selectedFile || !selectedType) return;
    setStep("uploading");
    await upload(selectedFile, {
      caption: `${selectedType === "duet" ? "Duet" : "Stitch"} with @${creatorName}`,
    });
  }, [selectedFile, selectedType, upload, creatorName]);

  const handleBack = useCallback(() => {
    if (step === "upload") {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setStep("select");
    } else if (step === "uploading" && !isUploading && !isProcessing) {
      setStep("upload");
    }
  }, [step, previewUrl, isUploading, isProcessing]);

  const handleClose = useCallback(
    (openState: boolean) => {
      if (!openState && (isUploading || isProcessing)) {
        const confirmed = window.confirm(
          "Upload in progress. Are you sure you want to cancel?",
        );
        if (!confirmed) return;
        cancelUpload();
      }
      if (!openState) {
        // Reset everything
        setSelectedType(null);
        setStep("select");
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
        setNewVideoId(null);
        resetUpload();
        setActiveTab("create");
      }
      onOpenChange(openState);
    },
    [
      isUploading,
      isProcessing,
      cancelUpload,
      previewUrl,
      resetUpload,
      onOpenChange,
    ],
  );

  const handleDone = () => {
    handleClose(false);
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── Computed ─────────────────────────────────────────────────────────────

  const isWideModal = step === "upload" || step === "uploading";
  const isLinking = createDuetStitchMutation.isPending;
  const showBackButton =
    step === "upload" || (step === "uploading" && isUploadError);

  const statusLabel = useMemo(() => {
    if (isUploading) return "Uploading video...";
    if (isProcessing) return "Processing video...";
    if (isReady && isLinking) return "Linking to original...";
    if (isReady) return "Complete!";
    if (isUploadError) return "Upload failed";
    return "";
  }, [isUploading, isProcessing, isReady, isLinking, isUploadError]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-h-[85vh] overflow-y-auto transition-all duration-300",
          isWideModal ? "max-w-2xl" : "max-w-md",
        )}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1">
              <DialogTitle>
                {step === "success"
                  ? "Done!"
                  : step === "uploading"
                    ? `Creating ${selectedType}`
                    : "Duet & Stitch"}
              </DialogTitle>
              <DialogDescription>
                {step === "select" &&
                  "React to this video by creating your own"}
                {step === "upload" &&
                  `Upload a video to ${selectedType} with ${creatorName}`}
                {step === "uploading" && statusLabel}
                {step === "success" &&
                  `Your ${selectedType} has been created successfully`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Tabs (only on select step) ── */}
        {step === "select" ? (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "create" | "browse")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="create" className="flex-1">
                Create
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex-1">
                Browse ({countsData?.totalCount ?? 0})
              </TabsTrigger>
            </TabsList>

            {/* ── CREATE TAB ── */}
            <TabsContent value="create" className="space-y-4 pt-2">
              <OriginalVideoPreview
                videoThumbnailUrl={videoThumbnailUrl}
                videoThumbnailProxyUrl={originalThumbnailProxyUrl}
                creatorName={creatorName}
                creatorImage={creatorImage}
                duetCount={countsData?.duetCount ?? 0}
                stitchCount={countsData?.stitchCount ?? 0}
              />

              <TypeSelector
                selectedType={selectedType}
                allowDuet={allowDuet}
                allowStitch={allowStitch}
                onSelect={setSelectedType}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleContinueToUpload}
                  disabled={!selectedType}
                >
                  Continue
                </Button>
              </div>
            </TabsContent>

            {/* ── BROWSE TAB ── */}
            <TabsContent value="browse" className="space-y-3 pt-2">
              {/* Filter pills */}
              <div className="flex gap-2">
                {(["all", "duet", "stitch"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setBrowseFilter(filter)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                      browseFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {isBrowseLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : browseItems.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No{" "}
                    {browseFilter === "all"
                      ? "duets or stitches"
                      : `${browseFilter}s`}{" "}
                    yet. Be the first!
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {browseItems.map((item) => (
                        <BrowseCard
                          key={item.relationId}
                          item={item}
                          onClick={() => {
                            handleClose(false);
                            router.push(`/videos?v=${item.video.id}`);
                          }}
                        />
                      ))}
                    </div>
                    {hasNextPage && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void fetchNextPage()}
                          disabled={isFetchingNextPage}
                        >
                          {isFetchingNextPage ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : null}
                          Load more
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        {/* ── UPLOAD STEP ── */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="grid max-h-[50vh] gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
              {/* Original video context */}
              <div className="flex min-h-0 flex-col gap-2">
                <p className="shrink-0 text-xs font-medium text-muted-foreground">
                  Original
                </p>
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-muted">
                  {videoThumbnailUrl ? (
                    <img
                      src={originalThumbnailProxyUrl}
                      alt="Original video"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {selectedType === "duet" ? "Side-by-side" : "Before yours"}
                  </div>
                </div>
                <p className="shrink-0 truncate text-xs text-muted-foreground">
                  by {creatorName}
                </p>
              </div>

              {/* Upload zone */}
              <div className="flex min-h-0 flex-col gap-2">
                <p className="shrink-0 text-xs font-medium text-muted-foreground">
                  Your {selectedType}
                </p>
                {selectedFile && previewUrl ? (
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-black">
                    <video
                      src={previewUrl}
                      className="h-full w-full object-contain"
                      controls
                      muted
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => {
                        URL.revokeObjectURL(previewUrl);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getRootProps({
                      className: cn(
                        "flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                      ),
                    })}
                  >
                    <input {...getInputProps()} />
                    <div className="rounded-full bg-primary/10 p-3">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div className="px-4 text-center">
                      <p className="text-xs font-medium">
                        {isDragActive ? "Drop here" : "Drag & drop"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        MP4, WebM, MOV up to 500MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilePicker();
                      }}
                    >
                      Select file
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Layout indicator */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              {selectedType === "duet" ? (
                <>
                  <div className="flex gap-0.5">
                    <div className="h-6 w-4 rounded-sm bg-primary/30" />
                    <div className="h-6 w-4 rounded-sm bg-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Your video plays side-by-side with the original
                  </span>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-0.5">
                    <div className="h-3 w-8 rounded-sm bg-primary/30" />
                    <div className="h-3 w-8 rounded-sm bg-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Original clip plays first, then your video continues
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={() => void handleStartUpload()}
                disabled={!selectedFile}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload & Create {selectedType}
              </Button>
            </div>
          </div>
        )}

        {/* ── UPLOADING STEP ── */}
        {step === "uploading" && (
          <div className="space-y-5">
            {/* Side-by-side preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[9/16] max-h-[240px] overflow-hidden rounded-lg bg-muted">
                {videoThumbnailUrl ? (
                  <img
                    src={originalThumbnailProxyUrl}
                    alt="Original"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  Original
                </div>
              </div>
              <div className="relative aspect-[9/16] max-h-[240px] overflow-hidden rounded-lg bg-black">
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    className="h-full w-full object-contain"
                    muted
                  />
                ) : null}
                <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  Your {selectedType}
                </div>

                {/* Overlay states */}
                {(isUploading || isProcessing || isLinking) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <p className="mt-2 text-xs font-medium text-white">
                      {statusLabel}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            {(isUploading || isProcessing) && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{isUploading ? "Uploading" : "Processing"}</span>
                  {isUploading && (
                    <span>
                      {progress.overall}%
                      {muxEnabled
                        ? ` (S3: ${progress.s3}% · Mux: ${progress.mux}%)`
                        : ""}
                    </span>
                  )}
                </div>
                <Progress
                  value={isUploading ? progress.overall : undefined}
                  className="h-2"
                />
              </div>
            )}

            {/* Error state */}
            {isUploadError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  {uploadError ?? "Something went wrong"}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetUpload();
                      setStep("upload");
                    }}
                  >
                    Back
                  </Button>
                  <Button size="sm" onClick={() => void handleStartUpload()}>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Cancel while in progress */}
            {(isUploading || isProcessing) && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    cancelUpload();
                    resetUpload();
                    setStep("upload");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {selectedType === "duet" ? "Duet" : "Stitch"} created!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your video has been linked to {creatorName}&apos;s original
              </p>
            </div>
            <div className="flex gap-2">
              {newVideoId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClose(false);
                    router.push(`/videos?v=${newVideoId}`);
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  View video
                </Button>
              )}
              <Button onClick={handleDone}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function OriginalVideoPreview({
  videoThumbnailUrl,
  videoThumbnailProxyUrl,
  creatorName,
  creatorImage,
  duetCount,
  stitchCount,
}: {
  videoThumbnailUrl?: string | null;
  videoThumbnailProxyUrl: string;
  creatorName: string;
  creatorImage?: string | null;
  duetCount: number;
  stitchCount: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="relative h-16 w-12 overflow-hidden rounded bg-muted">
        {videoThumbnailUrl ? (
          <img
            src={videoThumbnailProxyUrl}
            alt="Original video"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {creatorImage ? (
              <AvatarImage src={creatorImage} alt={creatorName} />
            ) : null}
            <AvatarFallback className="text-[10px]">
              {creatorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{creatorName}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {duetCount} duets · {stitchCount} stitches
        </p>
      </div>
    </div>
  );
}

function TypeSelector({
  selectedType,
  allowDuet,
  allowStitch,
  onSelect,
}: {
  selectedType: "duet" | "stitch" | null;
  allowDuet: boolean;
  allowStitch: boolean;
  onSelect: (type: "duet" | "stitch") => void;
}) {
  if (!allowDuet && !allowStitch) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        The creator has disabled duets and stitches for this video
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allowDuet && (
        <button
          onClick={() => onSelect("duet")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border p-4 transition-colors",
            selectedType === "duet"
              ? "border-primary bg-primary/5"
              : "hover:bg-muted/50",
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              selectedType === "duet" ? "bg-primary" : "bg-muted",
            )}
          >
            <Layers
              className={cn(
                "h-5 w-5",
                selectedType === "duet"
                  ? "text-primary-foreground"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Duet</p>
            <p className="text-sm text-muted-foreground">
              Create side-by-side video with the original
            </p>
          </div>
          {/* Layout preview */}
          <div className="flex gap-0.5 opacity-60">
            <div className="h-8 w-3 rounded-sm bg-muted-foreground/30" />
            <div className="h-8 w-3 rounded-sm bg-muted-foreground/60" />
          </div>
        </button>
      )}

      {allowStitch && (
        <button
          onClick={() => onSelect("stitch")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border p-4 transition-colors",
            selectedType === "stitch"
              ? "border-primary bg-primary/5"
              : "hover:bg-muted/50",
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              selectedType === "stitch" ? "bg-primary" : "bg-muted",
            )}
          >
            <GitBranch
              className={cn(
                "h-5 w-5",
                selectedType === "stitch"
                  ? "text-primary-foreground"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Stitch</p>
            <p className="text-sm text-muted-foreground">
              Use part of this video, then add your own
            </p>
          </div>
          {/* Layout preview */}
          <div className="flex flex-col gap-0.5 opacity-60">
            <div className="h-4 w-6 rounded-sm bg-muted-foreground/30" />
            <div className="h-4 w-6 rounded-sm bg-muted-foreground/60" />
          </div>
        </button>
      )}
    </div>
  );
}

interface BrowseItem {
  relationId: number;
  type: "duet" | "stitch";
  createdAt: string | null;
  video: {
    id: number;
    caption: string | null;
    thumbnailUrl: string | null;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    creator: {
      id: number;
      name: string;
      image: string | null;
      isInfluencer: boolean;
    };
  };
}

function BrowseCard({
  item,
  onClick,
}: {
  item: BrowseItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg border bg-muted transition-colors hover:border-primary/50"
    >
      <div className="relative aspect-[9/16]">
        {item.video.thumbnailUrl ? (
          <img
            src={getVideoThumbnailProxyUrl(
              item.video.id,
              item.video.thumbnailUrl,
            )}
            alt={item.video.caption ?? "Video"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium capitalize text-white">
          {item.type}
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="flex items-center gap-2 text-[10px] text-white">
            <span className="flex items-center gap-0.5">
              <Heart className="h-2.5 w-2.5" />
              {formatCount(item.video.likeCount)}
            </span>
            <span className="flex items-center gap-0.5">
              <MessageCircle className="h-2.5 w-2.5" />
              {formatCount(item.video.commentCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-1.5 p-1.5">
        <Avatar className="h-4 w-4">
          {item.video.creator.image ? (
            <AvatarImage
              src={item.video.creator.image}
              alt={item.video.creator.name}
            />
          ) : null}
          <AvatarFallback className="text-[8px]">
            {item.video.creator.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-[10px] text-muted-foreground">
          {item.video.creator.name}
        </span>
      </div>
    </button>
  );
}

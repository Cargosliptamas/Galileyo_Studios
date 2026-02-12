"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Gauge,
  Loader2,
  RotateCcw,
  Scissors,
  Type,
  Upload,
  Wand2,
} from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";
import { toast } from "@galileyo/ui/toast";

import type { TextOverlay, VideoFilter } from "~/hooks/use-video-processor";
import { useVideoProcessor } from "~/hooks/use-video-processor";
import { EditorPreview } from "./editor/editor-preview";
import { ExportDialog } from "./editor/export-dialog";
import { TextOverlayEditor } from "./editor/text-overlay-editor";
import { VideoFilters } from "./editor/video-filters";
import { VideoTimeline } from "./editor/video-timeline";

interface VideoEditorProps {
  file: File;
  onSave?: (blob: Blob) => void;
  onUpload?: (blob: Blob) => void;
  onCancel?: () => void;
  className?: string;
}

// Speed presets
const SPEED_OPTIONS = [
  { value: 0.25, label: "0.25x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
];

export function VideoEditor({
  file,
  onSave: _onSave,
  onUpload,
  onCancel,
  className,
}: VideoEditorProps) {
  // Video state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Edit state
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState<VideoFilter>("none");
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState("trim");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // Video processor
  const processor = useVideoProcessor();

  // Create video URL on mount
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Initialize end time when duration is known
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    setEndTime(newDuration);
  }, []);

  // Reset all edits
  const handleReset = useCallback(() => {
    setStartTime(0);
    setEndTime(duration);
    setSpeed(1);
    setFilter("none");
    setTextOverlays([]);
  }, [duration]);

  // Check if any edits have been made
  const hasEdits =
    startTime > 0 ||
    endTime < duration ||
    speed !== 1 ||
    filter !== "none" ||
    textOverlays.length > 0;

  // Start export process
  const handleExport = useCallback(async () => {
    try {
      const blob = await processor.processVideo(file, {
        trim:
          startTime > 0 || endTime < duration
            ? { startTime, endTime }
            : undefined,
        speed: speed !== 1 ? speed : undefined,
        filter: filter !== "none" ? filter : undefined,
        textOverlays: textOverlays.length > 0 ? textOverlays : undefined,
      });

      if (blob) {
        setResultBlob(blob);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [
    processor,
    file,
    startTime,
    endTime,
    duration,
    speed,
    filter,
    textOverlays,
  ]);

  // Handle upload to platform
  const handleUpload = useCallback(
    (blob: Blob) => {
      onUpload?.(blob);
      setShowExportDialog(false);
    },
    [onUpload],
  );

  // Handle download
  const handleDownload = useCallback(
    (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Video downloaded!");
    },
    [file.name],
  );

  // Open export dialog and reset result
  const openExportDialog = useCallback(() => {
    setResultBlob(null);
    setShowExportDialog(true);
  }, []);

  if (!videoUrl) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Edit Video</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasEdits}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button size="sm" onClick={openExportDialog}>
            <Upload className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-[1fr_350px]">
        {/* Preview */}
        <div className="space-y-4">
          <EditorPreview
            src={videoUrl}
            startTime={startTime}
            endTime={endTime}
            speed={speed}
            filter={filter}
            textOverlays={textOverlays}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDurationChange={handleDurationChange}
          />

          {/* Timeline */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <VideoTimeline
              duration={duration}
              currentTime={currentTime}
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onSeek={setCurrentTime}
            />
          </div>
        </div>

        {/* Tools panel */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trim" className="gap-1 text-xs">
                <Scissors className="h-3 w-3" />
                <span className="hidden sm:inline">Trim</span>
              </TabsTrigger>
              <TabsTrigger value="speed" className="gap-1 text-xs">
                <Gauge className="h-3 w-3" />
                <span className="hidden sm:inline">Speed</span>
              </TabsTrigger>
              <TabsTrigger value="filters" className="gap-1 text-xs">
                <Wand2 className="h-3 w-3" />
                <span className="hidden sm:inline">Filters</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-1 text-xs">
                <Type className="h-3 w-3" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {/* Trim tab */}
              <TabsContent value="trim" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Scissors className="h-4 w-4" />
                    Trim Video
                  </h3>
                  <p className="text-xs text-slate-500">
                    Drag the handles on the timeline or enter precise times
                    below.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        Start Time
                      </label>
                      <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900">
                        <span className="font-mono text-sm">
                          {formatTime(startTime)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        End Time
                      </label>
                      <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900">
                        <span className="font-mono text-sm">
                          {formatTime(endTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        New Duration
                      </span>
                      <span className="font-mono text-sm font-medium text-cyan-600 dark:text-cyan-400">
                        {formatTime(endTime - startTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Speed tab */}
              <TabsContent value="speed" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Gauge className="h-4 w-4" />
                    Playback Speed
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust the playback speed. Slow motion or speed up your
                    video.
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {SPEED_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={speed === option.value ? "primary" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setSpeed(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  {speed !== 1 && (
                    <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/30">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {speed < 1
                          ? `Video will play ${(1 / speed).toFixed(1)}x slower`
                          : `Video will play ${speed}x faster`}
                      </p>
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        New duration:{" "}
                        <span className="font-mono font-medium">
                          {formatTime((endTime - startTime) / speed)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Filters tab */}
              <TabsContent value="filters" className="space-y-4">
                <VideoFilters
                  selectedFilter={filter}
                  onFilterChange={setFilter}
                />
              </TabsContent>

              {/* Text tab */}
              <TabsContent value="text" className="space-y-4">
                <TextOverlayEditor
                  overlays={textOverlays}
                  duration={duration}
                  currentTime={currentTime}
                  onOverlaysChange={setTextOverlays}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Export dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        isProcessing={processor.isProcessing}
        progress={processor.progress}
        currentStep={processor.currentStep}
        error={processor.error}
        resultBlob={resultBlob}
        onExport={handleExport}
        onUpload={handleUpload}
        onDownload={handleDownload}
      />
    </div>
  );
}

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
}

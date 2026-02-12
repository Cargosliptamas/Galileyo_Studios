"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Download, Loader2, Play, X } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Progress } from "@galileyo/ui/progress";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  resultBlob: Blob | null;
  onExport: () => void;
  onUpload: (blob: Blob) => void;
  onDownload: (blob: Blob) => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  isProcessing,
  progress,
  currentStep,
  error,
  resultBlob,
  onExport,
  onUpload,
  onDownload,
}: ExportDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create preview URL when blob is ready
  const handlePreview = useCallback(() => {
    if (resultBlob) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(resultBlob));
    }
  }, [resultBlob, previewUrl]);

  // Handle upload
  const handleUpload = useCallback(() => {
    if (resultBlob) {
      onUpload(resultBlob);
    }
  }, [resultBlob, onUpload]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (resultBlob) {
      onDownload(resultBlob);
    }
  }, [resultBlob, onDownload]);

  // Cleanup on close
  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      onOpenChange(isOpen);
    },
    [previewUrl, onOpenChange],
  );

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
          <DialogDescription>
            Process and export your edited video
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Not started state */}
          {!isProcessing && !resultBlob && !error && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Export Settings
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Your video will be processed with all applied edits (trim,
                  speed, filters, and text overlays).
                </p>
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  <li>• Format: MP4 (H.264)</li>
                  <li>• Quality: High (CRF 23)</li>
                  <li>• Audio: AAC 128kbps</li>
                </ul>
              </div>

              <Button onClick={onExport} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Start Processing
              </Button>
            </div>
          )}

          {/* Processing state */}
          {isProcessing && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
                <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {currentStep}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Please don&apos;t close this window
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <p className="text-center text-xs text-slate-400">
                Processing is done entirely in your browser. Large videos may
                take several minutes.
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Processing Failed
                </p>
                <p className="mt-1 text-center text-xs text-red-500">{error}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleClose(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={onExport}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Success state */}
          {resultBlob && !isProcessing && !error && (
            <div className="space-y-4">
              {/* Preview */}
              {previewUrl ? (
                <div className="relative aspect-[9/16] max-h-[300px] overflow-hidden rounded-lg bg-black">
                  <video
                    src={previewUrl}
                    controls
                    className="h-full w-full object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition-colors hover:border-cyan-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-cyan-500"
                  onClick={handlePreview}
                >
                  <Play className="h-8 w-8 text-cyan-500" />
                  <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Click to preview
                  </p>
                </div>
              )}

              {/* File info */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Video Ready!
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {formatSize(resultBlob.size)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button className="flex-1" onClick={handleUpload}>
                  Upload to Galileyo
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@galileyo/ui/cropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Separator } from "@galileyo/ui/separator";
import { Slider } from "@galileyo/ui/slider";
import { toast } from "@galileyo/ui/toast";

import { updateHeaderPicture } from "~/app/actions";
import { useFileUpload } from "~/hooks/use-file-upload";
import { isVisibleError } from "~/lib/visible-error";
import { useTRPC } from "~/trpc/react";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) =>
      reject(new Error(error.message)),
    );
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height,
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}

export function Cover() {
  const trpc = useTRPC();
  const { data: currentUser } = useSuspenseQuery(
    trpc.profile.getProfile.queryOptions(),
  );

  const queryClient = useQueryClient();

  const removeHeaderPicture = useMutation(
    trpc.profile.removeHeader.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Header image removed successfully");
      },
      onError: () => {
        toast.error("Failed to remove header image");
      },
    }),
  );

  const [isUploading, setIsUploading] = useState(false);

  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({ accept: "image/*" });

  const previewUrl = files[0]?.preview ?? null;
  const fileId = files[0]?.id;

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const previousFileIdRef = useRef<string | undefined | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
      if (!croppedBlob)
        throw new Error("Failed to generate cropped image blob.");

      const newFinalUrl = URL.createObjectURL(croppedBlob);
      if (finalImageUrl) URL.revokeObjectURL(finalImageUrl);

      setIsUploading(true);
      const formData = new FormData();
      formData.append(
        "header_file",
        new File([croppedBlob], "cover-image.jpg"),
      );
      await updateHeaderPicture(formData);

      setFinalImageUrl(newFinalUrl);
      setIsDialogOpen(false);
      toast.success("Cover image updated successfully.");
      await queryClient.invalidateQueries(trpc.profile.pathFilter());
    } catch (error) {
      setIsDialogOpen(false);
      let errorMessage = "Failed to update cover image. Please try again.";
      if (isVisibleError(error)) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    return () => {
      if (currentFinalUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Cover Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100/50 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="aspect-[3/1] w-full">
            {typeof currentUser.header === "string" && currentUser.header ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.header}
                alt="Cover image"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500">
                No cover image
              </div>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex gap-2">
            <div
              className="has-disabled:pointer-events-none has-disabled:opacity-50 relative outline-none transition-colors focus-visible:ring-[3px] has-[img]:border-none data-[dragging=true]:bg-accent/50"
              onClick={openFileDialog}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-dragging={isDragging || undefined}
              aria-label={
                finalImageUrl ? "Change cover image" : "Upload cover image"
              }
            >
              <Button variant="outline" disabled={isUploading}>
                <Upload className="mr-2 inline h-4 w-4" />
                Upload Cover
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={() => removeHeaderPicture.mutate()}
              disabled={removeHeaderPicture.isPending}
            >
              {removeHeaderPicture.isPending ? (
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 inline h-4 w-4" />
              )}
              Remove
            </Button>
            <input
              {...getInputProps()}
              className="sr-only"
              aria-label="Upload cover image"
              tabIndex={-1}
            />
          </div>
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-700" />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-140 *:[button]:hidden gap-0 p-0">
            <DialogDescription className="sr-only">
              Crop image dialog
            </DialogDescription>
            <DialogHeader className="contents space-y-0 text-left">
              <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="-my-1 opacity-60"
                    onClick={() => setIsDialogOpen(false)}
                    aria-label="Cancel"
                  >
                    <ArrowLeftIcon aria-hidden="true" />
                  </Button>
                  <span>Crop cover image</span>
                </div>
                <Button
                  className="-my-1"
                  onClick={handleApply}
                  disabled={!previewUrl || isUploading}
                  autoFocus
                >
                  {isUploading ? "Applying..." : "Apply"}
                </Button>
              </DialogTitle>
            </DialogHeader>
            {previewUrl && (
              <Cropper
                className="sm:h-120 h-96"
                image={previewUrl}
                zoom={zoom}
                onCropChange={handleCropChange}
                onZoomChange={setZoom}
                aspectRatio={16 / 9}
              >
                <CropperDescription />
                <CropperImage />
                <CropperCropArea />
              </Cropper>
            )}
            <DialogFooter className="border-t px-4 py-6">
              <div className="mx-auto flex w-full max-w-80 items-center gap-4">
                <ZoomOutIcon
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                <Slider
                  defaultValue={[1]}
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0] ?? 1)}
                  aria-label="Zoom slider"
                />
                <ZoomInIcon
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default Cover;

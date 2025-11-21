"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash, UploadCloud } from "lucide-react";
import { z } from "zod/v4";

import type { PrivateFeedType } from "@galileyo/validators/feed";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@galileyo/ui/form";
import { Input } from "@galileyo/ui/input";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";
import { CreatePrivateFeedSchema } from "@galileyo/validators/my-feed";

import { useTRPC } from "~/trpc/react";
import { ImageCropper } from "../ui/image-cropper";

const PrivateFeedFormSchema = CreatePrivateFeedSchema.extend({
  image: z.custom<Blob>().nullable(),
});

type PrivateFeedFormType = z.infer<typeof PrivateFeedFormSchema>;

export function PrivateFeedModal({
  type = "create",
  onSuccess,
  onError,
  isOpen,
  onOpenChange,
  initialValues,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: "create" | "edit";
  onSuccess?: (data: PrivateFeedType) => void;
  onError?: (error: Error) => void;
  initialValues: PrivateFeedType | null;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const privateFeedForm = useForm({
    schema: PrivateFeedFormSchema,
    defaultValues: {
      title: "",
      description: null,
      image: null,
    },
  });

  useEffect(() => {
    privateFeedForm.reset({
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? null,
      image: null,
    });
    if (initialValues?.image) {
      setSelectedImage(initialValues.image);
    } else {
      setSelectedImage(null);
    }
  }, [initialValues, privateFeedForm]);

  const createPrivateFeed = useMutation(
    trpc.myFeeds.private.create.mutationOptions({
      onSuccess: async (data) => {
        privateFeedForm.reset();
        await queryClient.invalidateQueries(
          trpc.myFeeds.private.list.pathFilter(),
        );
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Private feed created successfully");
        onSuccess?.(data);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create private feed");
        onError?.(new Error(err.message));
      },
    }),
  );

  const updatePrivateFeed = useMutation(
    trpc.myFeeds.private.update.mutationOptions({
      onSuccess: async (data) => {
        privateFeedForm.reset();
        await queryClient.invalidateQueries(
          trpc.myFeeds.private.list.pathFilter(),
        );
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Private feed updated successfully");
        onSuccess?.(data);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update private feed");
        onError?.(new Error(err.message));
      },
    }),
  );

  const handleSubmit = useCallback(
    (data: PrivateFeedFormType, id?: number) => {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.image) {
        formData.append("image_file", new File([data.image], "feed-image.jpg"));
      }

      if (id) {
        formData.append("id", id.toString());
      }

      if (type === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        createPrivateFeed.mutate(formData as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        updatePrivateFeed.mutate(formData as any);
      }
    },
    [type, createPrivateFeed.mutate, updatePrivateFeed.mutate],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      privateFeedForm.reset();
      setSelectedImage(null);
      onOpenChange(open);
    },
    [onOpenChange, privateFeedForm],
  );

  const handleImageApply = useCallback(
    (croppedImage: Blob) => {
      setSelectedImage((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(croppedImage);
      });
      privateFeedForm.setValue("image", croppedImage);

      return Promise.resolve(true);
    },
    [privateFeedForm],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <Form {...privateFeedForm}>
          <form
            className="space-y-4"
            onSubmit={privateFeedForm.handleSubmit((data) => {
              handleSubmit(data, initialValues?.id);
            })}
          >
            <DialogHeader>
              <DialogTitle>
                {type === "create"
                  ? "Create New Private Feed"
                  : "Edit Private Feed"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {type === "create"
                ? "Create a new private feed to share content with invited followers."
                : "Update your private feed details."}
            </DialogDescription>
            <div className="flex flex-col gap-2">
              <FormField
                control={privateFeedForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Title" />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Maximum 20 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={privateFeedForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Description"
                        rows={5}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Maximum 140 characters. Optional.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={privateFeedForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <ImageCropper
                        imageUrl={selectedImage ?? undefined}
                        aspectRatio={1 / 1}
                        onApply={handleImageApply}
                      >
                        {selectedImage ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <img
                              src={selectedImage}
                              alt="Image"
                              className="h-40 w-40 object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="flex w-full gap-2"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedImage(null);
                                field.onChange(null);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                              Remove Image
                            </Button>
                          </div>
                        ) : (
                          <div className="flex h-40 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 p-2 dark:border-slate-600">
                            <UploadCloud className="h-4 w-4" />
                            <span>Upload Image</span>
                          </div>
                        )}
                      </ImageCropper>
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Optional. Upload an image for your private feed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={
                  createPrivateFeed.isPending || updatePrivateFeed.isPending
                }
              >
                {createPrivateFeed.isPending || updatePrivateFeed.isPending
                  ? "Saving..."
                  : type === "create"
                    ? "Create Feed"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

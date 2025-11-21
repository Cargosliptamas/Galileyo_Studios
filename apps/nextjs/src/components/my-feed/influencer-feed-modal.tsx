"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StickyNote, Trash, UploadCloud } from "lucide-react";
import { z } from "zod/v4";

import type { InfluencerFeedType } from "@galileyo/validators/feed";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@galileyo/ui/accordion";
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
import { CreateInfluencerFeedSchema } from "@galileyo/validators/my-feed";

import { useTRPC } from "~/trpc/react";
import { ImageCropper } from "../ui/image-cropper";

const InfluencerFeedFormSchema = CreateInfluencerFeedSchema.extend({
  image: z.custom<Blob>().nullable(),
});

type InfluencerFeedFormType = z.infer<typeof InfluencerFeedFormSchema>;

export function InfluencerFeedModal({
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
  onSuccess?: (data: InfluencerFeedType) => void;
  onError?: (error: Error) => void;
  initialValues: InfluencerFeedType | null;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const influencerFeedForm = useForm({
    schema: InfluencerFeedFormSchema,
    defaultValues: {
      title: "",
      description: "",
      image: null,
      alias: "",
      page_title: null,
      page_description: null,
    },
  });

  useEffect(() => {
    influencerFeedForm.reset({
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      image: null,
      alias: initialValues?.alias ?? "",
      page_title: initialValues?.page_title ?? null,
      page_description: initialValues?.page_description ?? null,
    });
  }, [initialValues, influencerFeedForm]);

  const createInfluencerFeed = useMutation(
    trpc.myFeeds.influencer.create.mutationOptions({
      onSuccess: async (data) => {
        influencerFeedForm.reset();
        await queryClient.invalidateQueries(
          trpc.myFeeds.influencer.list.pathFilter(),
        );
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Feed created successfully");
        onSuccess?.(data.influencer_feed);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create feed");
        onError?.(new Error(err.message));
      },
    }),
  );

  const updateInfluencerFeed = useMutation(
    trpc.myFeeds.influencer.update.mutationOptions({
      onSuccess: async (data) => {
        influencerFeedForm.reset();
        await queryClient.invalidateQueries(
          trpc.myFeeds.influencer.list.pathFilter(),
        );
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Feed updated successfully");
        onSuccess?.(data.influencer_feed);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update feed");
        onError?.(new Error(err.message));
      },
    }),
  );

  const handleSubmit = useCallback(
    (data: InfluencerFeedFormType, id?: number) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("alias", data.alias);
      formData.append("page_title", data.page_title ?? data.title);
      formData.append(
        "page_description",
        data.page_description ?? data.description,
      );

      if (data.image) {
        formData.append("has_image", "1");
        formData.append("image_file", new File([data.image], "feed-image.jpg"));
      }

      if (id) {
        formData.append("id", id.toString());
      }

      if (type === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        createInfluencerFeed.mutate(formData as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        updateInfluencerFeed.mutate(formData as any);
      }
    },
    [type, createInfluencerFeed.mutate, updateInfluencerFeed.mutate],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      influencerFeedForm.reset();
      setSelectedImage(null);
      onOpenChange(open);
    },
    [onOpenChange, influencerFeedForm],
  );

  const handleImageApply = useCallback(
    (croppedImage: Blob) => {
      setSelectedImage((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(croppedImage);
      });
      influencerFeedForm.setValue("image", croppedImage);

      return Promise.resolve(true);
    },
    [influencerFeedForm],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <Form {...influencerFeedForm}>
          <form
            className="space-y-4"
            onSubmit={influencerFeedForm.handleSubmit((data) => {
              handleSubmit(data, initialValues?.id);
            })}
          >
            <DialogHeader>
              <DialogTitle>Create New Feed</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Create a new feed to share your content with your followers.
            </DialogDescription>
            <div className="flex flex-col gap-2">
              <FormField
                control={influencerFeedForm.control}
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
                control={influencerFeedForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description" rows={5} />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Maximum 140 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={influencerFeedForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <ImageCropper
                        imageUrl={field.value ? "" : undefined}
                        aspectRatio={1 / 1}
                        onApply={handleImageApply}
                      >
                        {field.value ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <img
                              src={selectedImage ?? ""}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={influencerFeedForm.control}
                name="alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alias</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Alias" />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Your link will contain this alias. Lower case, no special
                      characters. Maximum 63 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Accordion type="single" collapsible>
                <AccordionItem value="page-details">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      <span>Page Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <FormField
                      control={influencerFeedForm.control}
                      name="page_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Title</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Page Title"
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-muted-foreground">
                            The title of the page that will be displayed in the
                            browser tab. Maximum 63 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={influencerFeedForm.control}
                      name="page_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Page Description"
                              rows={5}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-muted-foreground">
                            The description of the page that will be displayed
                            as the meta description. Maximum 140 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={
                  createInfluencerFeed.isPending ||
                  updateInfluencerFeed.isPending
                }
              >
                {createInfluencerFeed.isPending ||
                updateInfluencerFeed.isPending
                  ? "Saving..."
                  : "Save Feed"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

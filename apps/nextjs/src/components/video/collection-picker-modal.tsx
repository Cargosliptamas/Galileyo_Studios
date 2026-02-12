"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Check, FolderPlus, Loader2, Plus } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";

interface CollectionPickerModalProps {
  videoId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function CollectionPickerModal({
  videoId,
  open,
  onOpenChange,
  onSaved,
}: CollectionPickerModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);

  const { data: collectionsData, isLoading: collectionsLoading } = useQuery({
    ...trpc.video.getCollections.queryOptions({ limit: 50 }),
    enabled: open,
  });

  const saveMutation = useMutation(
    trpc.video.saveVideo.mutationOptions({
      onSuccess: () => {
        toast.success("Video saved to collection");
        void queryClient.invalidateQueries(
          trpc.video.getSavedVideos.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.video.getCollections.pathFilter(),
        );
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
        onOpenChange(false);
        onSaved?.();
      },
      onError: () => {
        toast.error("Failed to save video");
      },
    }),
  );

  const createCollectionMutation = useMutation(
    trpc.video.createCollection.mutationOptions({
      onSuccess: (data) => {
        toast.success("Collection created");
        setNewCollectionName("");
        setShowNewCollection(false);
        setSelectedCollectionId(data.id);
        void queryClient.invalidateQueries(
          trpc.video.getCollections.pathFilter(),
        );
      },
      onError: () => {
        toast.error("Failed to create collection");
      },
    }),
  );

  const handleSave = () => {
    saveMutation.mutate({
      videoId,
      collectionId: selectedCollectionId ?? undefined,
    });
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    createCollectionMutation.mutate({
      name: newCollectionName.trim(),
      isPublic: false,
    });
  };

  const collections = collectionsData?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to save this video to
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto py-4">
          {collectionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Default save option */}
              <button
                onClick={() => setSelectedCollectionId(null)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                  selectedCollectionId === null &&
                    "border-primary bg-primary/5",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bookmark className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Saved Videos</p>
                  <p className="text-sm text-muted-foreground">
                    Default collection
                  </p>
                </div>
                {selectedCollectionId === null && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>

              {/* User collections */}
              {collections
                .filter((c) => !c.isDefault)
                .map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setSelectedCollectionId(collection.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                      selectedCollectionId === collection.id &&
                        "border-primary bg-primary/5",
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {collection.coverUrl ? (
                        <img
                          src={collection.coverUrl}
                          alt={collection.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <FolderPlus className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {collection.videoCount} videos
                      </p>
                    </div>
                    {selectedCollectionId === collection.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}

              {/* Create new collection */}
              {showNewCollection ? (
                <div className="space-y-2 rounded-lg border p-3">
                  <Label htmlFor="new-collection">Collection name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-collection"
                      placeholder="My Collection"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      autoFocus
                    />
                    <Button
                      size="icon"
                      onClick={handleCreateCollection}
                      disabled={
                        !newCollectionName.trim() ||
                        createCollectionMutation.isPending
                      }
                    >
                      {createCollectionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewCollection(true)}
                  className="flex w-full items-center gap-3 rounded-lg border border-dashed p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    Create new collection
                  </p>
                </button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  FolderPlus,
  Globe,
  Loader2,
  Lock,
  MoreVertical,
  Trash2,
} from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { Switch } from "@galileyo/ui/switch";
import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";

interface CollectionsListProps {
  className?: string;
}

export function CollectionsList({ className }: CollectionsListProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [deleteCollectionId, setDeleteCollectionId] = useState<number | null>(
    null,
  );

  const { data, isLoading, error } = useQuery(
    trpc.video.getCollections.queryOptions({ limit: 50 }),
  );

  const createMutation = useMutation(
    trpc.video.createCollection.mutationOptions({
      onSuccess: () => {
        toast.success("Collection created");
        setShowCreateDialog(false);
        setNewCollectionName("");
        setNewCollectionPublic(false);
        void queryClient.invalidateQueries(
          trpc.video.getCollections.pathFilter(),
        );
      },
      onError: () => {
        toast.error("Failed to create collection");
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.video.deleteCollection.mutationOptions({
      onSuccess: () => {
        toast.success("Collection deleted");
        setDeleteCollectionId(null);
        void queryClient.invalidateQueries(
          trpc.video.getCollections.pathFilter(),
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    createMutation.mutate({
      name: newCollectionName.trim(),
      isPublic: newCollectionPublic,
    });
  };

  const handleDeleteCollection = () => {
    if (!deleteCollectionId) return;
    deleteMutation.mutate({ collectionId: deleteCollectionId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Failed to load collections
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Create button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Collections</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Collections grid */}
      {data?.items && data.items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {data.items.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onDelete={() => setDeleteCollectionId(collection.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bookmark className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            No collections yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Create a collection to organize your saved videos
          </p>
          <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your saved videos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Collection"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public</Label>
                <p className="text-sm text-muted-foreground">
                  Others can view this collection
                </p>
              </div>
              <Switch
                checked={newCollectionPublic}
                onCheckedChange={setNewCollectionPublic}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteCollectionId !== null}
        onOpenChange={() => setDeleteCollectionId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this collection? Videos saved to
              this collection will be moved to your default saved videos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCollectionId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCollection}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CollectionCardProps {
  collection: {
    id: number;
    name: string;
    description: string | null;
    isPublic: boolean;
    isDefault: boolean;
    videoCount: number;
    coverUrl: string | null;
  };
  onDelete: () => void;
}

function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      <Link href={`/profile/collections/${collection.id}`}>
        {/* Cover image or placeholder */}
        <div className="aspect-video bg-muted">
          {collection.coverUrl ? (
            <img
              src={collection.coverUrl}
              alt={collection.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Bookmark className="h-8 w-8 text-primary/50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium">{collection.name}</h4>
            {collection.isDefault && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Default
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {collection.isPublic ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            <span>{collection.videoCount} videos</span>
          </div>
        </div>
      </Link>

      {/* Actions dropdown */}
      {!collection.isDefault && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

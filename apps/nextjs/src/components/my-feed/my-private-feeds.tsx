"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EllipsisIcon, Pencil, Plus, Trash } from "lucide-react";

import type { PrivateFeedType } from "@galileyo/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import { toast } from "@galileyo/ui/toast";

import type { ColumnDefWithLabel } from "../ui/table/columns/types";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { DataTable } from "../ui/table/DataTable";
import { DataTableColumnHeader } from "../ui/table/DataTableColumnHeader";
import { PrivateFeedModal } from "./private-feed-modal";
import { PrivateFeedStatsCards } from "./private-feed-stats-cards";

export function MyPrivateFeeds() {
  const [selectedFeed, setSelectedFeed] = useState<PrivateFeedType | null>(
    null,
  );
  const [changeType, setChangeType] = useState<
    "create" | "edit" | "delete" | null
  >(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.myFeeds.private.list.queryOptions({}),
  );

  const handleModalClose = () => {
    setChangeType(null);
    setSelectedFeed(null);
  };

  const deletePrivateFeed = useMutation(
    trpc.myFeeds.private.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.myFeeds.private.list.pathFilter().queryKey,
        });
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Private feed deleted successfully");
        handleModalClose();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete private feed");
      },
    }),
  );

  const privateFeedColumns: ColumnDefWithLabel<PrivateFeedType>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        label: "ID",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={"ID"} />
        ),
      },
      {
        accessorKey: "title",
        label: "Title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={""} />
        ),
        cell: ({ row }) => (
          <UserAvatar
            name={row.original.title}
            image={row.original.image ?? null}
            isVerified={false}
            isInfluencer={false}
            size="small"
          >
            <span className="line-clamp-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              {row.original.description ?? "No description"}
            </span>
          </UserAvatar>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={"Actions"} />
        ),
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedFeed(row.original);
                  setChangeType("edit");
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedFeed(row.original);
                  setChangeType("delete");
                }}
              >
                <Trash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      {/* Stats and Info Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PrivateFeedStatsCards data={data} isLoading={isLoading} />
      </div>

      <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Private Feeds
            <div className="ml-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setChangeType("create");
                  setSelectedFeed(null);
                }}
                disabled={(data?.private_feed_remainder ?? 0) <= 0}
              >
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DataTable
            data={data?.list ?? []}
            columns={privateFeedColumns}
            rowCount={data?.list.length}
            isLoading={isLoading}
          />

          <PrivateFeedModal
            type={changeType === "create" ? "create" : "edit"}
            isOpen={changeType === "create" || changeType === "edit"}
            onOpenChange={handleModalClose}
            initialValues={selectedFeed}
            onSuccess={() => {
              handleModalClose();
            }}
          />

          <Dialog
            open={changeType === "delete"}
            onOpenChange={handleModalClose}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Private Feed</DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>
              <div className="flex flex-col gap-2">
                <span>
                  Are you sure you want to delete the{" "}
                  <Badge variant="outline">{selectedFeed?.title ?? ""}</Badge>{" "}
                  private feed?
                </span>
                <span>
                  After deleting the feed, you will no longer be able to access
                  it and all followers will lose access.
                </span>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (selectedFeed) {
                      deletePrivateFeed.mutate({
                        id: selectedFeed.id,
                      });
                    }
                  }}
                  disabled={deletePrivateFeed.isPending}
                >
                  {deletePrivateFeed.isPending ? "Deleting..." : "Delete Feed"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

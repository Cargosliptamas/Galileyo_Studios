"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CopyIcon,
  EllipsisIcon,
  History,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";

import type { InfluencerFeedType } from "@galileyo/validators";
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
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { toast } from "@galileyo/ui/toast";

import type { ColumnDefWithLabel } from "../ui/table/columns/types";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { CopyButton } from "../ui/copy-button";
import { DataTable } from "../ui/table/DataTable";
import { DataTableColumnHeader } from "../ui/table/DataTableColumnHeader";
import { FeedHistoryDialog } from "./feed-history-dialog";
import { InfluencerFeedModal } from "./influencer-feed-modal";
import { InfluencerFeedStatsCards } from "./influencer-feed-stats-cards";

export function MyInfluencerFeeds() {
  const [selectedFeed, setSelectedFeed] = useState<InfluencerFeedType | null>(
    null,
  );
  const [changeType, setChangeType] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [isPromocodeModalOpen, setIsPromocodeModalOpen] = useState(false);
  const [promocodeValue, setPromocodeValue] = useState("");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.myFeeds.influencer.list.queryOptions({}),
  );

  const handleModalClose = () => {
    setChangeType(null);
    setSelectedFeed(null);
  };

  const handlePromocodeModalOpen = () => {
    setPromocodeValue(data?.promocode ?? "");
    setIsPromocodeModalOpen(true);
  };

  const handlePromocodeModalClose = () => {
    setIsPromocodeModalOpen(false);
    setPromocodeValue("");
  };

  const deleteInfluencerFeed = useMutation(
    trpc.myFeeds.influencer.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.myFeeds.influencer.list.pathFilter(),
        );
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Feed deleted successfully");
        handleModalClose();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete feed");
      },
    }),
  );

  const editPromocode = useMutation(
    trpc.myFeeds.influencer.editPromocode.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.myFeeds.influencer.list.pathFilter(),
        );
        toast.success("Promocode updated successfully");
        handlePromocodeModalClose();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update promocode");
      },
    }),
  );

  const influencerFeedColumns: ColumnDefWithLabel<InfluencerFeedType>[] =
    useMemo(
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
            // <div className="w-1/2">
            <UserAvatar
              name={row.original.title}
              image={row.original.image ?? null}
              isVerified={false}
              isInfluencer={false}
              size="small"
            >
              <span className="line-clamp-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                {row.original.description}
              </span>
            </UserAvatar>
            // </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
        {
          accessorKey: "public_code",
          label: "Public Code",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"Public Code"} />
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {row.original.public_code}
              </span>
              <CopyButton text={row.original.public_code ?? ""} />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
        {
          accessorKey: "public_link",
          label: "Public Link",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"Public Link"} />
          ),
          cell: ({ row }) => (
            <CopyButton
              text={row.original.public_link}
              className="flex items-center gap-2"
              size="md"
            >
              Copy Link
              <CopyIcon className="h-4 w-4" />
            </CopyButton>
          ),
          enableSorting: false,
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
                    setIsHistoryDialogOpen(true);
                  }}
                >
                  <History className="h-4 w-4" />
                  History
                </DropdownMenuItem>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfluencerFeedStatsCards
          data={data}
          isLoading={isLoading}
          onEditPromocode={handlePromocodeModalOpen}
        />
      </div>

      <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Influencer Feeds
            <div className="ml-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setChangeType("create");
                  setSelectedFeed(null);
                }}
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
            columns={influencerFeedColumns}
            rowCount={data?.list.length}
            isLoading={isLoading}
          />

          <InfluencerFeedModal
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
                <DialogTitle>Delete Feed</DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>
              <div className="flex flex-col gap-2">
                <span>
                  Are you sure you want to delete the{" "}
                  <Badge variant="outline">{selectedFeed?.title ?? ""}</Badge>{" "}
                  feed?
                </span>
                <span>
                  After deleting the feed, you will no longer be able to access
                  it.
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
                      deleteInfluencerFeed.mutate({ id: selectedFeed.id });
                    }
                  }}
                  disabled={deleteInfluencerFeed.isPending}
                >
                  {deleteInfluencerFeed.isPending
                    ? "Deleting..."
                    : "Delete Feed"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isPromocodeModalOpen}
            onOpenChange={handlePromocodeModalClose}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Promocode</DialogTitle>
                <DialogDescription>
                  Enter your promocode. It must be unique and between 1-25
                  characters.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="promocode">Promocode</Label>
                  <Input
                    id="promocode"
                    value={promocodeValue}
                    onChange={(e) => setPromocodeValue(e.target.value)}
                    placeholder="Enter promocode"
                    maxLength={25}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePromocodeModalClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (promocodeValue.trim()) {
                      editPromocode.mutate({ text: promocodeValue.trim() });
                    } else {
                      toast.error("Promocode cannot be empty");
                    }
                  }}
                  disabled={editPromocode.isPending || !promocodeValue.trim()}
                >
                  {editPromocode.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <FeedHistoryDialog
            feed={selectedFeed}
            isOpen={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
            feedType="influencer"
          />
        </CardContent>
      </Card>
    </div>
  );
}

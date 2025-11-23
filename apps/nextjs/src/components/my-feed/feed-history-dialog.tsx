"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Users } from "lucide-react";

import type {
  InfluencerFeedType,
  PrivateFeedType,
} from "@galileyo/validators/feed";
import { Badge } from "@galileyo/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { ScrollArea } from "@galileyo/ui/scroll-area";

import type { ColumnDefWithLabel } from "../ui/table/columns/types";
import { useTRPC } from "~/trpc/react";
import { DataTable } from "../ui/table/DataTable";
import { DataTableColumnHeader } from "../ui/table/DataTableColumnHeader";

interface HistoryItemType {
  id: number;
  message: string;
  created_at: string;
  subscribers: number;
}

type FeedType = PrivateFeedType | InfluencerFeedType;

interface FeedHistoryDialogProps {
  feed: FeedType | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feedType: "private" | "influencer";
}

export function FeedHistoryDialog({
  feed,
  isOpen,
  onOpenChange,
  feedType,
}: FeedHistoryDialogProps) {
  const trpc = useTRPC();

  const { data: historyData, isLoading: historyLoading } = useQuery({
    ...(feedType === "private"
      ? trpc.myFeeds.private.history.queryOptions({
          id: feed?.id ?? 0,
          limit: 100,
          cursor: 1,
        })
      : trpc.myFeeds.influencer.history.queryOptions({
          id: feed?.id ?? 0,
          limit: 100,
          cursor: 1,
        })),
    enabled: !!feed && isOpen,
  });

  const historyColumns: ColumnDefWithLabel<HistoryItemType>[] = useMemo(
    () => [
      {
        accessorKey: "message",
        label: "Message",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Message" />
        ),
        cell: ({ row }) => (
          <div className="flex items-start gap-2">
            <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="line-clamp-3 max-w-2xl">
              {row.original.message}
            </span>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "subscribers",
        label: "Subscribers",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Subscribers" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">{row.original.subscribers}</Badge>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        label: "Sent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Sent" />
        ),
        cell: ({ row }) =>
          new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(row.original.created_at)),
        enableSorting: false,
      },
    ],
    [],
  );

  if (!feed) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Message History - {feed.title}</DialogTitle>
          <DialogDescription>
            View the history of messages sent to this{" "}
            {feedType === "private" ? "private feed" : "influencer feed"}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <DataTable
            data={historyData?.list ?? []}
            columns={historyColumns}
            rowCount={historyData?.count ?? 0}
            isLoading={historyLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

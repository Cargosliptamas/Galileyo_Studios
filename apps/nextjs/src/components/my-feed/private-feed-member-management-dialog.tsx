"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EllipsisIcon,
  Mail,
  Phone,
  RefreshCw,
  Trash,
  UserMinus,
} from "lucide-react";

import type { PrivateFeedType } from "@galileyo/validators/feed";
import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";
import { toast } from "@galileyo/ui/toast";

import type { ColumnDefWithLabel } from "../ui/table/columns/types";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { DataTable } from "../ui/table/DataTable";
import { DataTableColumnHeader } from "../ui/table/DataTableColumnHeader";

interface InviteType {
  id: number;
  email: string | null;
  phone_number: string | null;
  name: string | null;
  created_at: string;
}

interface FollowerType {
  id: number;
  photo: string | null;
  email: string | null;
  name: string;
  phone_number: string | null;
}

export function PrivateFeedMemberManagementDialog({
  feed,
  isOpen,
  onOpenChange,
}: {
  feed: PrivateFeedType | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"invites" | "followers">(
    "invites",
  );

  const { data: invitesData, isLoading: invitesLoading } = useQuery({
    ...trpc.myFeeds.private.getInvites.queryOptions({
      id: feed?.id ?? 0,
      limit: 100,
      cursor: 1,
    }),
    enabled: !!feed,
  });

  const { data: followersData, isLoading: followersLoading } = useQuery({
    ...trpc.myFeeds.private.getFollowers.queryOptions({
      id: feed?.id ?? 0,
      limit: 100,
      cursor: 1,
    }),
    enabled: !!feed,
  });

  const deleteInviteMutation = useMutation(
    trpc.myFeeds.private.deleteInvite.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.myFeeds.private.getInvites.pathFilter({}).queryKey,
        });
        toast.success("Invite deleted successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete invite");
      },
    }),
  );

  const reinviteMutation = useMutation(
    trpc.myFeeds.private.reInvite.mutationOptions({
      onSuccess: () => {
        toast.success("Invite resent successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to resend invite");
      },
    }),
  );

  const deleteFollowerMutation = useMutation(
    trpc.myFeeds.private.deleteFollower.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.myFeeds.private.getFollowers.pathFilter({}).queryKey,
        });
        toast.success("Follower removed successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to remove follower");
      },
    }),
  );

  const inviteColumns: ColumnDefWithLabel<InviteType>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        label: "Name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.name ? (
              <span className="font-medium">{row.original.name}</span>
            ) : (
              <span className="text-muted-foreground">No name</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "email",
        label: "Email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.email ? (
              <>
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.email}</span>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "phone_number",
        label: "Phone",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Phone" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.phone_number ? (
              <>
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.phone_number}</span>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        label: "Invited",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Invited" />
        ),
        cell: ({ row }) =>
          new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(row.original.created_at)),
        enableSorting: false,
      },
      {
        accessorKey: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
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
                  if (feed) {
                    reinviteMutation.mutate({
                      id: feed.id,
                      id_invite: row.original.id,
                    });
                  }
                }}
                disabled={reinviteMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" />
                Resend Invite
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive"
                onClick={() => {
                  if (feed) {
                    deleteInviteMutation.mutate({
                      id: feed.id,
                      id_invite: row.original.id,
                    });
                  }
                }}
                disabled={deleteInviteMutation.isPending}
              >
                <Trash className="h-4 w-4" />
                Delete Invite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [feed, reinviteMutation, deleteInviteMutation],
  );

  const followerColumns: ColumnDefWithLabel<FollowerType>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        label: "Member",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Member" />
        ),
        cell: ({ row }) => (
          <UserAvatar
            name={row.original.name}
            image={row.original.photo ?? null}
            isVerified={false}
            isInfluencer={false}
            size="small"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "email",
        label: "Email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.email ? (
              <>
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.email}</span>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "phone_number",
        label: "Phone",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Phone" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.phone_number ? (
              <>
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.phone_number}</span>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
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
                className="flex items-center gap-2 text-destructive"
                onClick={() => {
                  if (feed) {
                    deleteFollowerMutation.mutate({
                      id: feed.id,
                      id_follower: row.original.id,
                    });
                  }
                }}
                disabled={deleteFollowerMutation.isPending}
              >
                <UserMinus className="h-4 w-4" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [feed, deleteFollowerMutation],
  );

  if (!feed) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Members - {feed.title}</DialogTitle>
          <DialogDescription>
            Manage invites and members for this private feed.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invites">
              Invites
              {invitesData && (
                <Badge variant="secondary" className="ml-2">
                  {invitesData.count}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="followers">
              Members
              {followersData && (
                <Badge variant="secondary" className="ml-2">
                  {followersData.count}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invites" className="space-y-4">
            <DataTable
              data={invitesData?.list ?? []}
              columns={inviteColumns}
              rowCount={invitesData?.count ?? 0}
              isLoading={invitesLoading}
            />
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <DataTable
              data={followersData?.list ?? []}
              columns={followerColumns}
              rowCount={followersData?.count ?? 0}
              isLoading={followersLoading}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

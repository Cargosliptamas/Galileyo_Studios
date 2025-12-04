"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  EllipsisIcon,
  Mail,
  Plus,
  Trash,
  UserCheck,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import { Skeleton } from "@galileyo/ui/skeleton";
import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { AddMemberDialog } from "./add-member-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";

export function MemberManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    type: "member" | "template";
    id: number;
    name: string;
  } | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.members.list.queryOptions({}));

  const deleteMutation = useMutation(
    trpc.members.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.members.list.pathFilter().queryKey,
        });
        toast.success("Deleted successfully");
        setDeleteItem(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete");
      },
    }),
  );

  const sendInvitationMutation = useMutation(
    trpc.members.sendInvitation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.members.list.pathFilter().queryKey,
        });
        toast.success("Invitation sent successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to send invitation");
      },
    }),
  );

  const handleDelete = (type: "member" | "template", id: number) => {
    const item =
      type === "member"
        ? data?.members.find((m) => m.id === id)
        : data?.templates.find((t) => t.id === id);
    if (item) {
      setDeleteItem({
        type,
        id,
        name: item.full_name,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteItem) {
      deleteMutation.mutate({
        id: deleteItem.id,
        type: deleteItem.type,
      });
    }
  };

  const handleResendInvitation = (templateId: number) => {
    sendInvitationMutation.mutate({ id: templateId });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Admin Card Skeleton */}
        <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-20" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Active Members Card Skeleton */}
        <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-32" />
              <div className="ml-auto">
                <Skeleton className="h-9 w-36" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Invitations Card Skeleton */}
        <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardContent className="p-6">
          <div className="text-center text-slate-500 dark:text-slate-400">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Card */}
      <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <UserAvatar
              name={data.admin.full_name}
              image={null}
              isVerified={false}
              isInfluencer={false}
              size="small"
              onlyAvatar={true}
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-white">
                {data.admin.full_name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {data.admin.email}
              </div>
            </div>
            <Badge variant="outline" className="ml-auto">
              Admin
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Members */}
      <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Active Members
            <div className="ml-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add New Member
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.members.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              No active members yet
            </div>
          ) : (
            data.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <UserAvatar
                  name={member.full_name}
                  image={null}
                  isVerified={false}
                  isInfluencer={false}
                  size="small"
                  onlyAvatar={true}
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {member.full_name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {member.email}
                  </div>
                </div>
                {member.is_member_admin && (
                  <Badge variant="outline" className="mr-2">
                    Admin Rights
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <EllipsisIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive"
                      onClick={() => handleDelete("member", member.id)}
                    >
                      <Trash className="h-4 w-4" />
                      Delete Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.templates.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              No pending invitations
            </div>
          ) : (
            data.templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <UserAvatar
                  name={template.full_name}
                  image={null}
                  isVerified={false}
                  isInfluencer={false}
                  size="small"
                  onlyAvatar={true}
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {template.full_name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {template.email}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Expires:{" "}
                    {new Date(template.expired_at).toLocaleDateString()}
                  </div>
                </div>
                {template.is_expired && (
                  <Badge variant="outline" className="mr-2 text-destructive">
                    Expired
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <EllipsisIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => handleResendInvitation(template.id)}
                      disabled={sendInvitationMutation.isPending}
                    >
                      <Mail className="h-4 w-4" />
                      Resend Invitation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive"
                      onClick={() => handleDelete("template", template.id)}
                    >
                      <Trash className="h-4 w-4" />
                      Delete Template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <AddMemberDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteMemberDialog
        isOpen={deleteItem !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
        item={deleteItem}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

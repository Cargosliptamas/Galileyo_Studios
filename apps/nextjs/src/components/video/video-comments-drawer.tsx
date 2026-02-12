"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  Loader2,
  MoreHorizontal,
  Pin,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

import { cn } from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@galileyo/ui/sheet";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";

import { formatCount } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

interface VideoComment {
  id: number;
  videoId: number;
  userId: number;
  parentId: number | null;
  content: string;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  isHearted: boolean;
  isLiked: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    image: string | null;
    isInfluencer: boolean;
  };
}

interface VideoCommentsDrawerProps {
  videoId: number;
  videoOwnerId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: number;
}

export function VideoCommentsDrawer({
  videoId,
  videoOwnerId,
  open,
  onOpenChange,
  currentUserId,
}: VideoCommentsDrawerProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<VideoComment | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set(),
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { ref: loadMoreRef, inView } = useInView();

  const isVideoOwner = currentUserId === videoOwnerId;

  // Fetch comments
  const commentsQuery = useInfiniteQuery({
    ...trpc.video.getComments.infiniteQueryOptions({
      videoId,
      limit: 20,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as number | null,
    enabled: open,
  });

  const comments =
    commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  // Load more when scrolling
  useEffect(() => {
    if (
      inView &&
      commentsQuery.hasNextPage &&
      !commentsQuery.isFetchingNextPage
    ) {
      void commentsQuery.fetchNextPage();
    }
  }, [inView, commentsQuery]);

  // Create comment mutation
  const createCommentMutation = useMutation(
    trpc.video.createComment.mutationOptions({
      onSuccess: () => {
        setNewComment("");
        setReplyingTo(null);
        void queryClient.invalidateQueries(trpc.video.getComments.pathFilter());
        void queryClient.invalidateQueries(
          trpc.video.getCommentReplies.pathFilter(),
        );
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
        void queryClient.invalidateQueries(trpc.video.getById.pathFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // Delete comment mutation
  const deleteCommentMutation = useMutation(
    trpc.video.deleteComment.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.video.getComments.pathFilter());
        void queryClient.invalidateQueries(
          trpc.video.getCommentReplies.pathFilter(),
        );
        void queryClient.invalidateQueries(trpc.video.list.pathFilter());
        toast.success("Comment deleted");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // Toggle like mutation
  const toggleLikeMutation = useMutation(
    trpc.video.toggleCommentLike.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.video.getComments.pathFilter());
        void queryClient.invalidateQueries(
          trpc.video.getCommentReplies.pathFilter(),
        );
      },
    }),
  );

  // Pin comment mutation
  const pinCommentMutation = useMutation(
    trpc.video.togglePinComment.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries(trpc.video.getComments.pathFilter());
        toast.success(data.pinned ? "Comment pinned" : "Comment unpinned");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // Heart comment mutation
  const heartCommentMutation = useMutation(
    trpc.video.toggleHeartComment.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.video.getComments.pathFilter());
        void queryClient.invalidateQueries(
          trpc.video.getCommentReplies.pathFilter(),
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      createCommentMutation.mutate({
        videoId,
        content: newComment.trim(),
        parentId: replyingTo?.id,
      });
    },
    [newComment, videoId, replyingTo, createCommentMutation],
  );

  const handleReply = useCallback((comment: VideoComment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const toggleReplies = useCallback((commentId: number) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[70vh] flex-col rounded-t-xl p-0"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              {comments.length > 0
                ? `${formatCount(comments.length)} comments`
                : "Comments"}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {commentsQuery.isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isVideoOwner={isVideoOwner}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onDelete={(id) =>
                    deleteCommentMutation.mutate({ commentId: id })
                  }
                  onLike={(id) => toggleLikeMutation.mutate({ commentId: id })}
                  onPin={(id) => pinCommentMutation.mutate({ commentId: id })}
                  onHeart={(id) =>
                    heartCommentMutation.mutate({ commentId: id })
                  }
                  isExpanded={expandedReplies.has(comment.id)}
                  onToggleReplies={() => toggleReplies(comment.id)}
                  videoId={videoId}
                />
              ))}
              <div ref={loadMoreRef} className="h-1" />
              {commentsQuery.isFetchingNextPage && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment input */}
        <form
          onSubmit={handleSubmit}
          className="border-t bg-background px-4 py-3"
        >
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Replying to @{replyingTo.user.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={cancelReply}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
              className="max-h-[120px] min-h-[40px] resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || createCommentMutation.isPending}
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface CommentItemProps {
  comment: VideoComment;
  isVideoOwner: boolean;
  currentUserId: number;
  onReply: (comment: VideoComment) => void;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  onPin: (id: number) => void;
  onHeart: (id: number) => void;
  isExpanded: boolean;
  onToggleReplies: () => void;
  videoId: number;
  isReply?: boolean;
}

function CommentItem({
  comment,
  isVideoOwner,
  currentUserId,
  onReply,
  onDelete,
  onLike,
  onPin,
  onHeart,
  isExpanded,
  onToggleReplies,
  videoId,
  isReply = false,
}: CommentItemProps) {
  const trpc = useTRPC();
  const isOwner = currentUserId === comment.userId;
  const canDelete = isOwner || isVideoOwner;

  // Fetch replies when expanded
  const repliesQuery = useInfiniteQuery({
    ...trpc.video.getCommentReplies.infiniteQueryOptions({
      commentId: comment.id,
      limit: 10,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as number | null,
    enabled: isExpanded && comment.replyCount > 0,
  });

  const replies = repliesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className={cn("flex gap-3", isReply && "ml-10")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.image ?? undefined} />
        <AvatarFallback className="text-xs">
          {comment.user.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium">
                {comment.user.name}
              </span>
              {comment.user.isInfluencer && (
                <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
                  Creator
                </span>
              )}
              {comment.isPinned && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Pin className="h-3 w-3" /> Pinned
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <button
                onClick={() => onLike(comment.id)}
                className={cn(
                  "flex items-center gap-1 transition-colors hover:text-foreground",
                  comment.isLiked && "text-red-500 hover:text-red-600",
                )}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5",
                    comment.isLiked && "fill-current",
                  )}
                />
                {comment.likeCount > 0 && comment.likeCount}
              </button>

              {!isReply && (
                <button
                  onClick={() => onReply(comment)}
                  className="transition-colors hover:text-foreground"
                >
                  Reply
                </button>
              )}

              {comment.isHearted && (
                <span className="flex items-center gap-1 text-red-500">
                  <Heart className="h-3 w-3 fill-current" />
                  <span className="text-[10px]">by creator</span>
                </span>
              )}
            </div>

            {/* View replies */}
            {!isReply && comment.replyCount > 0 && (
              <button
                onClick={onToggleReplies}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                {isExpanded
                  ? "Hide replies"
                  : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
              </button>
            )}

            {/* Replies */}
            {isExpanded && (
              <div className="mt-3 space-y-3">
                {repliesQuery.isLoading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        isVideoOwner={isVideoOwner}
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onDelete={onDelete}
                        onLike={onLike}
                        onPin={onPin}
                        onHeart={onHeart}
                        isExpanded={false}
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        onToggleReplies={() => {}}
                        videoId={videoId}
                        isReply
                      />
                    ))}
                    {repliesQuery.hasNextPage && (
                      <button
                        onClick={() => repliesQuery.fetchNextPage()}
                        disabled={repliesQuery.isFetchingNextPage}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {repliesQuery.isFetchingNextPage
                          ? "Loading..."
                          : "Load more replies"}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* More options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isVideoOwner && !isReply && (
                <>
                  <DropdownMenuItem onClick={() => onPin(comment.id)}>
                    <Pin className="mr-2 h-4 w-4" />
                    {comment.isPinned ? "Unpin comment" : "Pin comment"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onHeart(comment.id)}>
                    <Heart
                      className={cn(
                        "mr-2 h-4 w-4",
                        comment.isHearted && "fill-red-500 text-red-500",
                      )}
                    />
                    {comment.isHearted ? "Remove heart" : "Heart comment"}
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete comment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

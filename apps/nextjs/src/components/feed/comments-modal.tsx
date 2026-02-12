import React, { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  // MoreHorizontal,
  Reply,
  Send,
  Smile,
} from "lucide-react";

import type {
  Comment as CommentType,
  FeedItem,
} from "@galileyo/validators/feed";
// import { Card, CardContent } from '@galileyo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@galileyo/ui/dropdown-menu";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@galileyo/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";
import { Separator } from "@galileyo/ui/separator";
import { toast } from "@galileyo/ui/toast";

import { authClient } from "~/auth/client";
import { useAbility } from "~/hooks/use-ability";
import { usePlanSwitch } from "~/hooks/use-plan-switch";
import { getProfilePicture } from "~/lib/user";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "./user-avatar";

function CommentComponent({
  comment,
  isReply = false,
  // parentId,
  setReplyingTo,
  replyingTo,
  replyText,
  setReplyText,
  handleSubmitReply,
}: {
  comment: CommentType;
  isReply?: boolean;
  parentId?: number;
  setReplyingTo: (id: number | null) => void;
  replyingTo: number | null;
  replyText: string;
  setReplyText: (text: string) => void;
  handleSubmitReply: (parentId: number) => void;
}) {
  const ability = useAbility();
  const [isExpanded, setIsExpanded] = useState(false);
  const trpc = useTRPC();

  const { data: replies, isLoading: isRepliesLoading } = useQuery({
    ...trpc.comment.getRepliesForComment.queryOptions({
      id: comment.id,
      limit: 100,
      cursor: 1,
    }),
    enabled: isExpanded,
  });

  const { data: session } = authClient.useSession();

  if (!session) {
    return null;
  }

  return (
    <div
      className={`${isReply ? "ml-12 border-l-2 border-slate-200 pl-4 dark:border-slate-700" : ""}`}
    >
      <div className="mb-4 flex gap-3">
        {/* <Avatar className="w-10 h-10">
          <AvatarImage src={comment.user.photo ?? ''} />
          <AvatarFallback className="bg-slate-700 text-white">
            {comment.user.full.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar> */}

        <div className="flex-1">
          {/* <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white text-sm">{comment.author.name}</h4>
            {comment.author.verified && (
              <Verified className="w-3 h-3 text-cyan-400 fill-current" />
            )}
            {comment.author.isInfluencer && (
              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                Influencer
              </span>
            )}
            <span className="text-slate-400 text-xs">{comment.author.username}</span>
            <span className="text-slate-500 text-xs">•</span>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Clock className="w-3 h-3" />
              {comment.timestamp}
            </div>
          </div> */}
          <UserAvatar
            name={comment.user.full_name}
            image={comment.user.photo ?? ""}
            isVerified={false}
            isInfluencer={false}
          >
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </UserAvatar>

          <p className="mb-3 text-sm leading-relaxed">{comment.message}</p>

          <div className="flex items-center gap-4">
            {/* <button 
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.is_liked
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`} />
              {comment.likes > 0 && <span>{formatNumber(comment.likes)}</span>}
            </button> */}

            {!isReply && ability.can("use", "can_comment_on_posts") && (
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400"
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>
            )}

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ext-slate-500 rounded p-1 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  Follow {comment.user.full_name}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Mute {comment.user.full_name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                  Report Comment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>

          {/* Reply Input */}
          {ability.can("use", "can_comment_on_posts") &&
            replyingTo === comment.id && (
              <div className="mt-3 flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getProfilePicture(session.user) ?? ""} />
                  <AvatarFallback className="bg-slate-700 text-white">
                    {session.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user.full_name}...`}
                    className="w-full resize-none rounded border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                    rows={2}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Smile className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit p-0">
                          <EmojiPicker
                            className="h-[342px]"
                            locale="en"
                            onEmojiSelect={({ emoji }) => {
                              setReplyText(`${replyText}${emoji}`);
                            }}
                          >
                            <EmojiPickerSearch />
                            <EmojiPickerContent />
                            <EmojiPickerFooter />
                          </EmojiPicker>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        className="flex items-center gap-1 rounded bg-cyan-500 px-3 py-1 text-sm text-white transition-colors hover:bg-cyan-400"
                        disabled={!replyText.trim()}
                      >
                        <Send className="h-3 w-3" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies > 0 && (
        <div className="ml-12">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="mb-3 flex items-center gap-2 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
            >
              <ChevronDown className="h-4 w-4" />
              View {comment.replies}{" "}
              {comment.replies === 1 ? "reply" : "replies"}
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsExpanded(false)}
                className="mb-3 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-300"
              >
                <ChevronUp className="h-4 w-4" />
                Hide replies
              </button>
              <div className="space-y-4">
                {isRepliesLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <CommentComponentSkeleton key={index} />
                  ))}
                {replies?.list.map((reply: CommentType) => (
                  <CommentComponent
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    setReplyingTo={setReplyingTo}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handleSubmitReply={handleSubmitReply}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CommentComponentSkeleton({ isReply = false }: { isReply?: boolean }) {
  return (
    <div
      className={`${isReply ? "ml-12 border-l-2 border-slate-200 pl-4 dark:border-slate-700" : ""}`}
    >
      <div className="mb-4 flex gap-3">
        <div className="flex-1">
          {/* User Avatar and Info Skeleton */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-300 dark:bg-slate-600" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Comment Text Skeleton */}
          <div className="mb-3 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-300 dark:bg-slate-600" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-300 dark:bg-slate-600" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-300 dark:bg-slate-600" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedItem;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: session } = authClient.useSession();
  const ability = useAbility();
  const { showPlansModal } = usePlanSwitch();

  const trpc = useTRPC();
  const { data: comments, isLoading } = useInfiniteQuery({
    ...trpc.comment.getCommentsForNews.infiniteQueryOptions({
      id: post.id ?? 0,
      limit: 100,
      cursor: 1,
    }),
    getNextPageParam: (lastPage) => lastPage.page + 1,
  });

  const queryClient = useQueryClient();
  const createComment = useMutation(
    trpc.comment.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.feed.pathFilter());
        await queryClient.invalidateQueries(trpc.comment.pathFilter());
      },
      onError: () => {
        toast.error("Failed to create comment");
      },
    }),
  );

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    if (post.id) {
      createComment.mutate({
        comment: newComment,
        newsId: post.id,
        parentId: null,
      });
    }

    setNewComment("");
  };

  const handleSubmitReply = (parentId: number) => {
    if (!replyText.trim()) return;

    if (post.id) {
      createComment.mutate({
        comment: replyText,
        newsId: post.id,
        parentId: parentId,
      });
    }

    setReplyText("");
    setReplyingTo(null);
  };

  const isTestAccount =
    session?.user.email.trim().toLowerCase() === "test@galileyo.com";

  // const CommentComponent: React.FC<{
  //   comment: CommentType;
  //   isReply?: boolean;
  //   parentId?: number
  // }> = ({ comment, isReply = false, parentId }) => {

  // }

  if (!session) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Comments ({post.comment_quantity})
          </DialogTitle>
        </DialogHeader>

        {/* Original Post Preview */}
        {/* <Card className="bg-slate-800/50 border-slate-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-white">{post.title}</span>
              <span className="text-slate-400 text-sm">• Original Post</span>
            </div>
            <p className="text-slate-300 text-sm line-clamp-3">{post.body}</p>
          </CardContent>
        </Card> */}

        {/* <Separator className="bg-slate-700" /> */}

        {/* Comments List */}
        <div className="max-h-96 flex-1 space-y-6 overflow-y-auto">
          {isLoading
            ? // Show skeleton loading state
              Array.from({ length: 3 }).map((_, index) => (
                <CommentComponentSkeleton key={index} />
              ))
            : comments?.pages.map((page) =>
                page.list.map((comment) => (
                  <CommentComponent
                    key={comment.id}
                    comment={comment}
                    setReplyingTo={setReplyingTo}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handleSubmitReply={handleSubmitReply}
                  />
                )),
              )}
        </div>

        <Separator className="bg-slate-700" />

        {/* Comment Input */}
        {isTestAccount ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            For commenting, you need to switch between plans. Log in to
            galileyo.com on your browser.
          </div>
        ) : ability.can("use", "can_comment_on_posts") ? (
          <div className="mb-4 flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getProfilePicture(session.user) ?? ""} />
              <AvatarFallback className="bg-slate-700 text-white">
                {session.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                rows={3}
                maxLength={280}
                disabled={isLoading}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Smile className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-0">
                      <EmojiPicker
                        className="h-[342px]"
                        locale="en"
                        onEmojiSelect={({ emoji }) => {
                          setNewComment((prev) => `${prev}${emoji}`);
                        }}
                      >
                        <EmojiPickerSearch />
                        <EmojiPickerContent />
                        <EmojiPickerFooter />
                      </EmojiPicker>
                    </PopoverContent>
                  </Popover>
                  <span className="text-sm text-slate-500">
                    {newComment.length}/280
                  </span>
                </div>
                <button
                  onClick={handleSubmitComment}
                  className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-400"
                  disabled={
                    !newComment.trim() || isLoading || createComment.isPending
                  }
                >
                  <Send className="h-4 w-4" />
                  Comment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">
                  You can&apos;t comment on posts on your current plan.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  To start commenting, please switch to a plan that includes
                  commenting capabilities.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={() => showPlansModal(true)}
              >
                Switch plan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentsModal;

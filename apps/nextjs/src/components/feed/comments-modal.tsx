import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  // Verified,
  Clock,
  // Heart,
  MoreHorizontal,
  Reply,
  Send,
  Smile,
} from "lucide-react";

import type { Comment as CommentType, FeedItem } from "@galileyo/api/schemas";
// import { Card, CardContent } from '@galileyo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import { Separator } from "@galileyo/ui/separator";

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
  const [isExpanded, setIsExpanded] = useState(false);

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

            {!isReply && (
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

            <DropdownMenu>
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
            </DropdownMenu>
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100" />
                <AvatarFallback className="bg-slate-700 text-white">
                  You
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
                    <button className="text-slate-400 transition-colors hover:text-cyan-400">
                      <Smile className="h-4 w-4" />
                    </button>
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
                {/* {comment.replies.map((reply) => (
                  <CommentComponent 
                    key={reply.id} 
                    comment={reply} 
                    isReply={true} 
                    parentId={comment.id} 
                  />
                ))} */}
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
  // const [comments, setComments] = useState<Comment[]>([
  //   {
  //     id: 1,
  //     author: {
  //       name: 'Emergency Response Team',
  //       username: '@emergency_response',
  //       avatar: 'https://images.pexels.com/photos/355952/pexels-photo-355952.jpeg?auto=compress&cs=tinysrgb&w=100',
  //       verified: true,
  //       isInfluencer: false
  //     },
  //     content: 'Thank you for this critical update. Our teams are coordinating response efforts in the affected areas. Stay safe everyone! 🚨',
  //     timestamp: '2 hours ago',
  //     likes: 156,
  //     isLiked: true,
  //     replies: [
  //       {
  //         id: 11,
  //         author: {
  //           name: 'Local Coordinator',
  //           username: '@local_coord',
  //           avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100',
  //           verified: false,
  //           isInfluencer: false
  //         },
  //         content: 'We have 3 shelters open and fully operational via satellite communication. Coordinates shared privately.',
  //         timestamp: '1 hour ago',
  //         likes: 23,
  //         isLiked: false,
  //         replies: []
  //       }
  //     ],
  //     isExpanded: true
  //   },
  //   {
  //     id: 2,
  //     author: {
  //       name: 'Tech Analyst',
  //       username: '@tech_analyst_pro',
  //       avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100',
  //       verified: true,
  //       isInfluencer: true
  //     },
  //     content: 'The satellite network redundancy is impressive. Even with terrestrial infrastructure down, we maintain 99.9% uptime. This is the future of emergency communications.',
  //     timestamp: '3 hours ago',
  //     likes: 89,
  //     isLiked: false,
  //     replies: [
  //       {
  //         id: 21,
  //         author: {
  //           name: 'Network Engineer',
  //           username: '@net_engineer',
  //           avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  //           verified: false,
  //           isInfluencer: false
  //         },
  //         content: 'The mesh topology with automatic failover is what makes this possible. Great engineering!',
  //         timestamp: '2 hours ago',
  //         likes: 34,
  //         isLiked: true,
  //         replies: []
  //       },
  //       {
  //         id: 22,
  //         author: {
  //           name: 'Satellite Ops',
  //           username: '@sat_ops_official',
  //           avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  //           verified: true,
  //           isInfluencer: false
  //         },
  //         content: 'Thanks for the recognition! Our team works 24/7 to maintain these standards. 🛰️',
  //         timestamp: '1 hour ago',
  //         likes: 67,
  //         isLiked: false,
  //         replies: []
  //       }
  //     ],
  //     isExpanded: false
  //   },
  //   {
  //     id: 3,
  //     author: {
  //       name: 'Field Reporter',
  //       username: '@field_reporter_live',
  //       avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100',
  //       verified: true,
  //       isInfluencer: true
  //     },
  //     content: 'Currently reporting from the affected zone. Galileyo is the only communication method working here. Absolutely essential for coordination and safety updates.',
  //     timestamp: '4 hours ago',
  //     likes: 234,
  //     isLiked: true,
  //     replies: []
  //   },
  //   {
  //     id: 4,
  //     author: {
  //       name: 'Community Volunteer',
  //       username: '@volunteer_help',
  //       avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  //       verified: false,
  //       isInfluencer: false
  //     },
  //     content: 'Setting up a community aid station. Using Galileyo to coordinate supply drops and medical assistance. Technology serving humanity! 💪',
  //     timestamp: '5 hours ago',
  //     likes: 78,
  //     isLiked: false,
  //     replies: [
  //       {
  //         id: 41,
  //         author: {
  //           name: 'Medical Team',
  //           username: '@medical_response',
  //           avatar: 'https://images.pexels.com/photos/355952/pexels-photo-355952.jpeg?auto=compress&cs=tinysrgb&w=100',
  //           verified: true,
  //           isInfluencer: false
  //         },
  //         content: 'Medical team en route to your location. ETA 30 minutes. Thank you for the coordination!',
  //         timestamp: '4 hours ago',
  //         likes: 45,
  //         isLiked: true,
  //         replies: []
  //       }
  //     ],
  //     isExpanded: false
  //   }
  // ]);

  const trpc = useTRPC();
  const { data: comments, isLoading } = useInfiniteQuery({
    ...trpc.comment.getCommentsForNews.infiniteQueryOptions({
      id: post.id ?? 0,
      limit: 100,
      cursor: 1,
    }),
    getNextPageParam: (lastPage) => lastPage.page + 1,
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    // const comment: Comment = {
    //   id: Date.now(),
    //   author: {
    //     name: 'You',
    //     username: '@your_username',
    //     avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100',
    //     verified: false,
    //     isInfluencer: false
    //   },
    //   content: newComment,
    //   timestamp: 'now',
    //   likes: 0,
    //   isLiked: false,
    //   replies: []
    // };

    // setComments(prev => [comment, ...prev]);
    setNewComment("");
  };

  const handleSubmitReply = (parentId: number) => {
    if (!replyText.trim()) return;

    // setComments(prevComments =>
    //   prevComments.map(comment =>
    //     comment.id === parentId
    //       ? {
    //           ...comment,
    //           replies: [...comment.replies, reply],
    //           isExpanded: true
    //         }
    //       : comment
    //   )
    // );

    console.log("parentId", parentId);

    setReplyText("");
    setReplyingTo(null);
  };

  // const CommentComponent: React.FC<{
  //   comment: CommentType;
  //   isReply?: boolean;
  //   parentId?: number
  // }> = ({ comment, isReply = false, parentId }) => {

  // }

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
        <div className="mb-4 flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100" />
            <AvatarFallback className="bg-slate-700 text-white">
              You
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
                <button className="text-slate-500 transition-colors hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400">
                  <Smile className="h-5 w-5" />
                </button>
                <span className="text-sm text-slate-500">
                  {newComment.length}/280
                </span>
              </div>
              <button
                onClick={handleSubmitComment}
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-400"
                disabled={!newComment.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsModal;

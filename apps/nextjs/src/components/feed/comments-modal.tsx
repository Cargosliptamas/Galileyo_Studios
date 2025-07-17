import React, { useState } from 'react';
import { 
  // Heart, 
  MoreHorizontal, 
  Send, 
  Smile,
  Reply,
  ChevronDown,
  ChevronUp,
  // Verified,
  Clock
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@galileyo/ui/dialog';
// import { Card, CardContent } from '@galileyo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@galileyo/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@galileyo/ui/dropdown-menu';
import { Separator } from '@galileyo/ui/separator';
import type { FeedItem, Comment as CommentType } from '@galileyo/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { UserAvatar } from './user-avatar';

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
  comment: CommentType,
  isReply?: boolean,
  parentId?: number,
  setReplyingTo: (id: number | null) => void,
  replyingTo: number | null,
  replyText: string,
  setReplyText: (text: string) => void, 
  handleSubmitReply: (parentId: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false);
    
  return (
    <div className={`${isReply ? 'ml-12 border-l-2 border-slate-200 dark:border-slate-700 pl-4' : ''}`}>
      <div className="flex gap-3 mb-4">
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
            image={comment.user.photo ?? ''}
            isVerified={false}
            isInfluencer={false}
          >
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
              <Clock className="w-3 h-3" />
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </UserAvatar>
          
          <p className="text-sm mb-3 leading-relaxed">{comment.message}</p>
          
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
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 ext-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
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
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100" />
                <AvatarFallback className="bg-slate-700 text-white">You</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user.full_name}...`}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  rows={2}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button className="text-slate-400 hover:text-cyan-400 transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSubmitReply(comment.id)}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-white text-sm rounded transition-colors flex items-center gap-1"
                      disabled={!replyText.trim()}
                    >
                      <Send className="w-3 h-3" />
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
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-3 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              View {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
            </button>
          ) : (
            <>
              <button 
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm mb-3 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
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
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
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
    setNewComment('');
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

    console.log('parentId', parentId);

    setReplyText('');
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
      <DialogContent className="max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
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
        <div className="flex-1 overflow-y-auto space-y-6 max-h-96">
          {comments?.pages.map((page) =>
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
            ))
          )}
        </div>

        <Separator className="bg-slate-700" />

        {/* Comment Input */}
        <div className="flex gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100" />
            <AvatarFallback className="bg-slate-700 text-white">You</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              rows={3}
              maxLength={280}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <button className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <span className="text-slate-500 text-sm">
                  {newComment.length}/280
                </span>
              </div>
              <button 
                onClick={handleSubmitComment}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                disabled={!newComment.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
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
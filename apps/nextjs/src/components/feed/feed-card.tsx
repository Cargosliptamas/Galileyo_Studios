import { Card, CardContent, CardHeader } from "@galileyo/ui/card";

import type { FeedItem } from "@galileyo/api";
import { AlertTriangle, Bookmark, Heart, MapPin, MessageCircle, MoreHorizontal, Satellite, Share, Verified } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@galileyo/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@galileyo/ui/dropdown-menu";
import { Separator } from "@galileyo/ui/separator";
import { useCommentsModal } from "~/hooks/use-comments-modal";

export default function FeedCard({ item }: { item: FeedItem }) {
  const { openModal } = useCommentsModal();
  const getPostTypeIcon = (type: string, emergencyLevel?: string) => {
    switch (type) {
      case 'emergency':
        return (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            emergencyLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
            emergencyLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
            emergencyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            Emergency Alert
          </div>
        );
      case 'satellite_update':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
            <Satellite className="w-3 h-3" />
            Network Update
          </div>
        );
      default:
        return null;
    }
  };

  const handleLike = () => {
    console.log('handleLike');
  };

  const handleBookmark = () => {
    console.log('handleBookmark');
  };

  const isInfluencer = item.type === 'influencer';
  const isVerified = item.type !== 'aaa';

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) {
      return '0';
    }

    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }

    return num.toString();
  };

  return (
    // <Card className="max-w-3xl mx-auto">
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={item.image} />
                <AvatarFallback className="bg-slate-700 text-white">
                  {(item.title || '').split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  {isVerified && (
                    <Verified className="w-4 h-4 text-cyan-400 fill-current" />
                  )}
                  {isInfluencer && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                      Influencer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>{item.title}</span>
                  <span>•</span>
                  <span>{item.created_at}</span>
                  {item.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                  Follow {item.title}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                  Mute {item.title}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Post Type Badge */}
          {getPostTypeIcon(item.type, item.emergency_level)}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Post Content */}
          <p className="text-slate-200 mb-4 leading-relaxed">{item.body}</p>
          
          {/* Post Image */}
          {item.images.length > 0 && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={item.images[0]?.sizes[0]?.url ?? ''} 
                alt="Post content" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Satellite Info */}
          {/* {post.satelliteInfo && (
            <div className="mb-4 p-3 bg-slate-900/50 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Coverage: </span>
                  <span className="text-cyan-400 font-medium">{post.satelliteInfo.coverage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">Signal: </span>
                  <span className="text-green-400 font-medium">{post.satelliteInfo.signal}</span>
                </div>
              </div>
            </div>
          )} */}

          <Separator className="my-4 bg-slate-700" />

          {/* Post Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleLike()}
                className={`flex items-center gap-2 transition-colors ${
                  item.is_liked ?? false
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-slate-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${item.is_liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{formatNumber(item.likes)}</span>
              </button>
              
              <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
                onClick={() => openModal(item)}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{formatNumber(item.comment_quantity)}</span>
              </button>
              
              <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                <Share className="w-5 h-5" />
                <span className="text-sm font-medium">{formatNumber(0)}</span>
              </button>
            </div>
            
            <button 
              onClick={() => handleBookmark()}
              className={`p-2 rounded-full transition-colors ${
                item.is_bookmarked ?? false
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-slate-400 hover:text-yellow-400'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${item.is_bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </CardContent>
    </Card>
  );
}
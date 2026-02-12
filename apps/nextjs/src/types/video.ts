export interface VideoCreator {
  id: number;
  name: string;
  image: string | null;
  isVerified?: boolean;
  isInfluencer?: boolean;
  subscriptionId?: number | null;
}

export interface VideoReactionCount {
  id: string; // reaction ID (1-6)
  cnt: number;
}

export interface VideoListItem {
  id: number;
  userId: number;
  caption: string | null;
  s3Key?: string | null;
  s3Url?: string | null;
  playbackId?: string | null;
  playbackUrl?: string | null;
  thumbnailUrl?: string | null;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  shareCount?: number;
  allowSharing?: boolean;
  isLiked?: boolean;
  isShared?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  userReactionId?: number | null;
  reactions?: VideoReactionCount[];
  creator: VideoCreator;
}

export interface VideoFeedResponse {
  muxEnabled: boolean;
  feedType?: "forYou" | "following";
  items: VideoListItem[];
  nextCursor: number | null;
  nextVideoId?: number | null;
}

export interface HashtagVideoFeedResponse {
  hashtag: {
    name: string;
    videoCount: number;
  };
  items: VideoListItem[];
  nextCursor: number | null;
  muxEnabled: boolean;
}

export interface SoundVideoFeedResponse {
  items: VideoListItem[];
  nextCursor: number | null;
  muxEnabled: boolean;
}

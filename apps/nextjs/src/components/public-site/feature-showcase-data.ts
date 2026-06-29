import type { Alert } from "@galileyo/validators";
import type {
  FeedItem,
  InfluencerItem,
  PrivateFeedType,
} from "@galileyo/validators/feed";

import type { VideoListItem } from "~/types/video";
import { env } from "~/env/client";

const GALILEYO_MOBILE_VIDEO_URL = env.NEXT_PUBLIC_GALILEYO_MOBILE_VIDEO_URL;

export type FeatureShowcaseBeatId =
  | "alerts-feed"
  | "alerts-map"
  | "video-1"
  | "video-swipe"
  | "chat-thread"
  | "private-feeds"
  | "notification-center";

export type FeatureShowcaseSurface =
  | "feed"
  | "alert-map"
  | "video"
  | "private-feeds"
  | "chat"
  | "notifications";

export type FeatureShowcaseBeatPhase = "intro" | "hold" | "outro";

export type FeatureShowcaseTransitionStyle =
  | "signal-reveal"
  | "radar-wipe"
  | "field-cut"
  | "gesture-carry"
  | "message-link"
  | "dossier-slide"
  | "alert-stack";

export type FeatureShowcaseBeatAccent =
  | "alert"
  | "map"
  | "video"
  | "private"
  | "chat"
  | "notification";

export type FeatureShowcaseCaptionAlign = "left" | "center";

export interface FeatureShowcaseTransition {
  label: string;
  style: FeatureShowcaseTransitionStyle;
  durationMs: number;
  accent: FeatureShowcaseBeatAccent;
}

export interface FeatureShowcaseBeat {
  id: FeatureShowcaseBeatId;
  label: string;
  caption: string;
  feature: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  surface: FeatureShowcaseSurface;
  accent: FeatureShowcaseBeatAccent;
  captionAlign?: FeatureShowcaseCaptionAlign;
  transition: FeatureShowcaseTransition;
}

export interface FeatureShowcaseBeatState {
  beat: FeatureShowcaseBeat;
  elapsedMs: number;
  beatElapsedMs: number;
  beatProgress: number;
  phase: FeatureShowcaseBeatPhase;
  phaseProgress: number;
  isTransitioning: boolean;
}

export interface ShowcasePrivateFeedRow extends PrivateFeedType {
  members: number;
  updatedAt: string;
  access: "Invite only" | "Trusted circle" | "Coordinated response";
}

export interface ShowcasePrivateFeedStatsData {
  list: { id: number }[];
  private_feed_maximum: number;
  private_feed_remainder: number;
}

export interface ShowcaseChatMessage {
  id: number;
  sender: "me" | "them";
  text: string;
  timestamp: string;
}

export interface ShowcaseNotificationItem {
  id: string;
  type: "alert" | "comment" | "follow" | "invite" | "system";
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  actor: {
    name: string;
    image: string | null;
  };
}

export const FEATURE_SHOWCASE_BEAT_DURATION_MS = 5_000;
export const FEATURE_SHOWCASE_TOTAL_DURATION_MS = 35_000;
export const FEATURE_SHOWCASE_INTRO_RATIO = 0.15;
export const FEATURE_SHOWCASE_HOLD_RATIO = 0.6;
export const FEATURE_SHOWCASE_OUTRO_RATIO = 0.25;

export const featureShowcaseBeats: FeatureShowcaseBeat[] = [
  {
    id: "alerts-feed",
    label: "Alerts Feed",
    caption: "Real-time alerts",
    feature: "Emergency feed",
    startMs: 0,
    endMs: 5_000,
    durationMs: 5_000,
    surface: "feed",
    accent: "alert",
    captionAlign: "left",
    transition: {
      label: "Incoming verified reports",
      style: "signal-reveal",
      durationMs: 650,
      accent: "alert",
    },
  },
  {
    id: "alerts-map",
    label: "Alerts Map",
    caption: "See it near you",
    feature: "Map awareness",
    startMs: 5_000,
    endMs: 10_000,
    durationMs: 5_000,
    surface: "alert-map",
    accent: "map",
    captionAlign: "left",
    transition: {
      label: "Locating nearby incidents",
      style: "radar-wipe",
      durationMs: 700,
      accent: "map",
    },
  },
  {
    id: "video-1",
    label: "Video Update",
    caption: "Updates from the ground",
    feature: "Short-form video",
    startMs: 10_000,
    endMs: 15_000,
    durationMs: 5_000,
    surface: "video",
    accent: "video",
    captionAlign: "left",
    transition: {
      label: "Switching to field footage",
      style: "field-cut",
      durationMs: 600,
      accent: "video",
    },
  },
  {
    id: "video-swipe",
    label: "Video Swipe",
    caption: "Live video reports",
    feature: "Feed momentum",
    startMs: 15_000,
    endMs: 20_000,
    durationMs: 5_000,
    surface: "video",
    accent: "video",
    captionAlign: "left",
    transition: {
      label: "Following live reports",
      style: "gesture-carry",
      durationMs: 560,
      accent: "video",
    },
  },
  {
    id: "chat-thread",
    label: "Chat",
    caption: "Direct response chat",
    feature: "Live coordination",
    startMs: 20_000,
    endMs: 25_000,
    durationMs: 5_000,
    surface: "chat",
    accent: "chat",
    captionAlign: "left",
    transition: {
      label: "Switching to live coordination",
      style: "message-link",
      durationMs: 620,
      accent: "chat",
    },
  },
  {
    id: "private-feeds",
    label: "Private Feeds",
    caption: "Share with your people",
    feature: "Trusted coordination",
    startMs: 25_000,
    endMs: 30_000,
    durationMs: 5_000,
    surface: "private-feeds",
    accent: "private",
    captionAlign: "left",
    transition: {
      label: "Moving into private coordination",
      style: "dossier-slide",
      durationMs: 680,
      accent: "private",
    },
  },
  {
    id: "notification-center",
    label: "Notifications",
    caption: "Instant notifications",
    feature: "Live activity",
    startMs: 30_000,
    endMs: 35_000,
    durationMs: 5_000,
    surface: "notifications",
    accent: "notification",
    captionAlign: "left",
    transition: {
      label: "Incoming activity across the network",
      style: "alert-stack",
      durationMs: 700,
      accent: "notification",
    },
  },
];

export function getFeatureShowcaseBeat(elapsedMs: number): FeatureShowcaseBeat {
  const loopedElapsed = elapsedMs % FEATURE_SHOWCASE_TOTAL_DURATION_MS;
  const activeBeat = featureShowcaseBeats.find(
    (beat) => loopedElapsed >= beat.startMs && loopedElapsed < beat.endMs,
  );

  if (activeBeat) {
    return activeBeat;
  }

  const fallbackBeat = featureShowcaseBeats[featureShowcaseBeats.length - 1];
  if (!fallbackBeat) {
    throw new Error("Feature showcase beats are not configured.");
  }

  return fallbackBeat;
}

function getFeatureShowcaseBeatPhase(
  beatElapsedMs: number,
  durationMs: number,
): Pick<FeatureShowcaseBeatState, "phase" | "phaseProgress"> {
  const introDuration = durationMs * FEATURE_SHOWCASE_INTRO_RATIO;
  const holdDuration = durationMs * FEATURE_SHOWCASE_HOLD_RATIO;
  const outroStart = introDuration + holdDuration;

  if (beatElapsedMs < introDuration) {
    return {
      phase: "intro",
      phaseProgress: beatElapsedMs / Math.max(introDuration, 1),
    };
  }

  if (beatElapsedMs < outroStart) {
    return {
      phase: "hold",
      phaseProgress:
        (beatElapsedMs - introDuration) / Math.max(holdDuration, 1),
    };
  }

  return {
    phase: "outro",
    phaseProgress:
      (beatElapsedMs - outroStart) / Math.max(durationMs - outroStart, 1),
  };
}

export function getFeatureShowcaseBeatState(
  elapsedMs: number,
): FeatureShowcaseBeatState {
  const beat = getFeatureShowcaseBeat(elapsedMs);
  const loopedElapsed = elapsedMs % FEATURE_SHOWCASE_TOTAL_DURATION_MS;
  const beatElapsedMs = Math.max(0, loopedElapsed - beat.startMs);
  const beatProgress = beatElapsedMs / Math.max(beat.durationMs, 1);
  const phaseState = getFeatureShowcaseBeatPhase(
    beatElapsedMs,
    beat.durationMs,
  );

  return {
    beat,
    elapsedMs: loopedElapsed,
    beatElapsedMs,
    beatProgress,
    phase: phaseState.phase,
    phaseProgress: phaseState.phaseProgress,
    isTransitioning: phaseState.phase === "intro",
  };
}

function createFeedItem(
  overrides: Partial<InfluencerItem> & {
    id: number;
    title: string;
    body: string;
    type: string;
  },
): FeedItem {
  return {
    id_subscription: null,
    emergency_level: null,
    created_at: "2026-03-04T09:00:00.000Z",
    location: "Los Angeles, CA",
    meta_data: {
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
      },
    },
    is_liked: false,
    is_bookmarked: false,
    is_subscribed: false,
    is_owner: false,
    show_reactions: true,
    show_comments: true,
    id_user: 41,
    is_repost: false,
    repost_caption: null,
    original_post: null,
    image: null,
    subtitle: "Community Desk",
    url: null,
    reactions: [
      { id: "4", cnt: 148, selected: false },
      { id: "5", cnt: 21, selected: false },
    ],
    images: [],
    video: null,
    comment_quantity: 18,
    ...overrides,
  } as FeedItem;
}

export const showcaseFeedItemsByBeat: Record<
  Extract<FeatureShowcaseBeatId, "alerts-feed">,
  FeedItem[]
> = {
  "alerts-feed": [
    createFeedItem({
      id: 301,
      type: "emergency",
      title: "Evacuation zone expanded",
      body: "Fire crews widened the evacuation perimeter east of Topanga Canyon. Shelter routes are now open through civic staging points.",
      emergency_level: "critical",
      comment_quantity: 52,
      reactions: [
        { id: "4", cnt: 224, selected: false },
        { id: "5", cnt: 74, selected: false },
      ],
    }),
    createFeedItem({
      id: 302,
      type: "influencer",
      title: "Road closure confirmed",
      subtitle: "Field Signal",
      body: "CHP has fully closed the ridge connector. Responders are routing traffic through the valley access corridor.",
      id_subscription: 910,
      comment_quantity: 31,
    }),
    createFeedItem({
      id: 303,
      type: "user",
      title: "Power outage updates",
      subtitle: "Neighborhood Response",
      body: "Backup generators are active in three blocks. Cooling centers remain open until the line inspection clears.",
      comment_quantity: 14,
    }),
  ],
};

export const showcaseAlerts: Alert[] = [
  {
    id: "alert-1",
    title: "Wildfire perimeter update",
    description:
      "Aerial crews confirmed active fire behavior north of the canyon. Evacuation lanes remain open and monitored.",
    type: "WILDFIRE",
    severity: "critical",
    location: {
      latitude: 34.1205,
      longitude: -118.5318,
      address: "Topanga Canyon Blvd, Los Angeles, CA",
      city: "Los Angeles",
      country: "United States",
    },
    timestamp: "2026-03-04T09:08:00.000Z",
    source: "County Fire",
    isActive: true,
    affectedArea: {
      radius: 8,
    },
  },
  {
    id: "alert-2",
    title: "High wind corridor",
    description:
      "Sustained gusts are pushing embers east. Crews advise avoiding exposed ridge roads until conditions stabilize.",
    type: "HIGHWIND",
    severity: "high",
    location: {
      latitude: 34.0832,
      longitude: -118.4871,
      address: "Pacific Palisades, Los Angeles, CA",
      city: "Los Angeles",
      country: "United States",
    },
    timestamp: "2026-03-04T09:11:00.000Z",
    source: "Weather Desk",
    isActive: true,
    affectedArea: {
      radius: 5,
    },
  },
  {
    id: "alert-3",
    title: "Traffic diversion active",
    description:
      "Emergency traffic control is rerouting vehicles southbound. Expect delays near temporary command points.",
    type: "INCIDENT",
    severity: "medium",
    location: {
      latitude: 34.0413,
      longitude: -118.5084,
      address: "Sunset Blvd, Los Angeles, CA",
      city: "Los Angeles",
      country: "United States",
    },
    timestamp: "2026-03-04T09:14:00.000Z",
    source: "Operations Center",
    isActive: true,
  },
];

export const showcaseAlertMapCenter = {
  latitude: 34.0832,
  longitude: -118.4871,
};

export const showcaseVideos: VideoListItem[] = [
  {
    id: 7001,
    userId: 81,
    caption:
      "Crews are closing the upper ridge road now. Smoke is moving east and checkpoints are active. #wildfire #fieldupdate",
    playbackUrl: GALILEYO_MOBILE_VIDEO_URL,
    thumbnailUrl: "/galileyo-mobile-poster.jpg",
    likeCount: 12430,
    commentCount: 328,
    shareCount: 92,
    viewCount: 56120,
    allowSharing: true,
    isLiked: false,
    isShared: false,
    isSaved: false,
    isFollowing: true,
    userReactionId: 4,
    reactions: [
      { id: "4", cnt: 12430 },
      { id: "5", cnt: 812 },
    ],
    creator: {
      id: 81,
      name: "Field Signal",
      image: null,
      isVerified: true,
      isInfluencer: true,
      subscriptionId: 701,
    },
  },
  {
    id: 7002,
    userId: 82,
    caption:
      "Visibility downtown is improving, but response teams are still moving equipment toward the foothills. #live #report",
    playbackUrl: GALILEYO_MOBILE_VIDEO_URL,
    thumbnailUrl: "/instant-alert.jpg",
    likeCount: 9820,
    commentCount: 214,
    shareCount: 67,
    viewCount: 43890,
    allowSharing: true,
    isLiked: false,
    isShared: false,
    isSaved: true,
    isFollowing: false,
    userReactionId: null,
    reactions: [
      { id: "4", cnt: 9820 },
      { id: "1", cnt: 406 },
    ],
    creator: {
      id: 82,
      name: "Skyline Watch",
      image: null,
      isVerified: true,
      isInfluencer: true,
      subscriptionId: 702,
    },
  },
  {
    id: 7003,
    userId: 83,
    caption:
      "Volunteer check-ins are moving into private coordination threads while public alerts stay visible in the main feed. #response",
    playbackUrl: GALILEYO_MOBILE_VIDEO_URL,
    thumbnailUrl: "/why3c.jpg",
    likeCount: 7560,
    commentCount: 161,
    shareCount: 44,
    viewCount: 28970,
    allowSharing: true,
    isLiked: false,
    isShared: false,
    isSaved: false,
    isFollowing: true,
    userReactionId: 5,
    reactions: [
      { id: "5", cnt: 7560 },
      { id: "4", cnt: 298 },
    ],
    creator: {
      id: 83,
      name: "Mutual Aid Live",
      image: null,
      isVerified: true,
      isInfluencer: true,
      subscriptionId: 703,
    },
  },
];

export const showcaseChatConversation = {
  participant: {
    name: "Field Signal",
    image: null,
    status: "Trusted signal active",
  },
  messages: [
    {
      id: 1,
      sender: "them",
      text: "Upper ridge road is closed. Use the canyon bypass checkpoint.",
      timestamp: "Now",
    },
    {
      id: 2,
      sender: "me",
      text: "Copy. Redirecting volunteers and shelter traffic now.",
      timestamp: "Now",
    },
    {
      id: 3,
      sender: "them",
      text: "Medical supply van clears the east route in 6 minutes.",
      timestamp: "Now",
    },
    {
      id: 4,
      sender: "me",
      text: "Received. I’ll keep the school lot open for transfer.",
      timestamp: "1m",
    },
    {
      id: 5,
      sender: "them",
      text: "Fire crews want masks staged beside the south entrance.",
      timestamp: "1m",
    },
    {
      id: 6,
      sender: "me",
      text: "Confirmed. Posting the update and notifying the team.",
      timestamp: "1m",
    },
  ] satisfies ShowcaseChatMessage[],
  draft: "Shelter route updated. Confirming arrivals.",
};

export const showcaseNotifications: ShowcaseNotificationItem[] = [
  {
    id: "notif-1",
    type: "alert",
    title: "Wildfire perimeter update",
    message: "The alert feed posted a new evacuation zone expansion.",
    timestamp: "Now",
    unread: true,
    actor: {
      name: "County Fire",
      image: null,
    },
  },
  {
    id: "notif-2",
    type: "comment",
    title: "New response comment",
    message: "Field Signal replied with a live route correction.",
    timestamp: "2m",
    unread: true,
    actor: {
      name: "Field Signal",
      image: null,
    },
  },
  {
    id: "notif-3",
    type: "follow",
    title: "New trusted follow",
    message: "Skyline Watch is now following your live updates.",
    timestamp: "5m",
    unread: false,
    actor: {
      name: "Skyline Watch",
      image: null,
    },
  },
  {
    id: "notif-4",
    type: "invite",
    title: "Private feed invite",
    message: "Neighborhood Response invited 3 new helpers to join.",
    timestamp: "7m",
    unread: false,
    actor: {
      name: "Neighborhood Response",
      image: null,
    },
  },
  {
    id: "notif-5",
    type: "system",
    title: "Pinned emergency bulletin",
    message:
      "Critical incident notices will stay locked to the top of your feed.",
    timestamp: "12m",
    unread: false,
    actor: {
      name: "Galileyo",
      image: null,
    },
  },
];

export const showcasePrivateFeedRows: ShowcasePrivateFeedRow[] = [
  {
    id: 901,
    title: "Neighborhood Response",
    description: "Trusted updates for local volunteers and family check-ins.",
    image: null,
    members: 14,
    updatedAt: "2 min ago",
    access: "Invite only",
  },
  {
    id: 902,
    title: "Medical Support",
    description:
      "Clinics, transport, and pharmacy coverage for affected areas.",
    image: null,
    members: 7,
    updatedAt: "11 min ago",
    access: "Trusted circle",
  },
  {
    id: 903,
    title: "Logistics Channel",
    description: "Supply movement, shelter delivery, and generator status.",
    image: null,
    members: 5,
    updatedAt: "23 min ago",
    access: "Coordinated response",
  },
];

export const showcasePrivateFeedStats: ShowcasePrivateFeedStatsData = {
  list: showcasePrivateFeedRows.map((row) => ({ id: row.id })),
  private_feed_maximum: 6,
  private_feed_remainder: 3,
};

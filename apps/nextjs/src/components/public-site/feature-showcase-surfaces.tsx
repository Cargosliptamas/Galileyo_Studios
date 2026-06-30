"use client";

import {
  AlertTriangle,
  Bell,
  Heart,
  Mail,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  SmilePlus,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@galileyo/ui/table";

import type {
  FeatureShowcaseBeat,
  FeatureShowcaseBeatPhase,
} from "./feature-showcase-data";
import { AlertCard } from "~/components/alert-map/alert-card";
import { AlertMap } from "~/components/alert-map/alert-map";
import FeedCard from "~/components/feed/feed-card";
import { UserAvatar } from "~/components/feed/user-avatar";
import { PrivateFeedStatsCards } from "~/components/my-feed/private-feed-stats-cards";
import { VideoInfo } from "~/components/video/video-info";
import { VideoPlayer } from "~/components/video/video-player";
import { VideoSidebar } from "~/components/video/video-sidebar";
import {
  showcaseAlertMapCenter,
  showcaseAlerts,
  showcaseChatConversation,
  showcaseFeedItemsByBeat,
  showcaseNotifications,
  showcasePrivateFeedRows,
  showcasePrivateFeedStats,
  showcaseVideos,
} from "./feature-showcase-data";

const showcaseFeedQueryKey = () =>
  ["feature-showcase", "feed", "mock"] as const;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getShowcaseVideo(index: number) {
  const video = showcaseVideos[index];

  if (!video) {
    throw new Error(`Missing showcase video at index ${index}.`);
  }

  return video;
}

function ShowcaseFeedSurface({ beatProgress }: { beatProgress: number }) {
  const items = showcaseFeedItemsByBeat["alerts-feed"];
  const livePulse = 1 + Math.sin(beatProgress * Math.PI * 4) * 0.06;
  const driftY = -18 * clamp01((beatProgress - 0.12) / 0.88);

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,80,80,0.14),transparent_40%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_36%),linear-gradient(180deg,#07101a_0%,#060b11_45%,#081421_100%)]" />
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          transform: `translateY(${driftY * 0.2}px)`,
        }}
      />

      <motion.div
        className="relative mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8"
        style={{ transform: `translateY(${driftY}px)` }}
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <motion.div style={{ scale: livePulse }}>
            <Badge className="border border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/10">
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Verified incidents
            </Badge>
          </motion.div>
          <Badge
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-200"
          >
            Discover feed
          </Badge>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300 sm:flex">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Live network
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-300 shadow-[0_20px_45px_rgba(4,9,16,0.3)] backdrop-blur-md">
          <div className="rounded-full bg-white px-4 py-2 font-medium text-slate-900">
            Discover
          </div>
          <div className="px-3 py-2">Subscriptions</div>
          <div className="ml-auto px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            Time ordered
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={false}
              animate={{
                opacity: clamp01((beatProgress - index * 0.06) / 0.28),
                y: 24 - clamp01((beatProgress - index * 0.06) / 0.28) * 24,
                scale: index === 0 ? 1.005 : 1,
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn(index === 0 && "relative")}
            >
              {index === 0 && (
                <div className="pointer-events-none absolute -inset-1 rounded-[28px] border border-red-400/25 bg-[radial-gradient(circle_at_top_right,rgba(248,113,113,0.22),transparent_40%)]" />
              )}
              <FeedCard
                item={item}
                isMocked={true}
                actionsDisabled={true}
                getQueryKeys={showcaseFeedQueryKey}
                getQueryKeysOnError={showcaseFeedQueryKey}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ShowcaseAlertsMapSurface({ beatProgress }: { beatProgress: number }) {
  const mapFocusProgress = clamp01((beatProgress - 0.12) / 0.52);
  const mapMarkers = [
    { id: "pulse-1", left: "48%", top: "32%" },
    { id: "pulse-2", left: "59%", top: "47%" },
    { id: "pulse-3", left: "43%", top: "58%" },
  ];

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(30,41,59,0.75),transparent_36%),linear-gradient(180deg,#07101a_0%,#060b11_45%,#081421_100%)]">
      <div className="mx-auto grid h-full w-full max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[1.35fr_0.65fr] lg:px-8 lg:py-8">
        <motion.div
          className="border-cyan-300/12 relative overflow-hidden rounded-[30px] border bg-slate-950/80 shadow-[0_30px_90px_rgba(3,7,18,0.55)]"
          style={{
            transform: `translate3d(${-24 * mapFocusProgress}px, ${16 * mapFocusProgress}px, 0) scale(${1 + mapFocusProgress * 0.08})`,
          }}
        >
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 text-xs uppercase tracking-[0.22em] text-slate-300 backdrop-blur-md">
            <span>Map awareness</span>
            <span>Los Angeles sector</span>
          </div>

          <div className="relative h-full min-h-[360px] pt-12 lg:min-h-[560px]">
            <div className="absolute inset-0 opacity-60">
              <AlertMap
                alerts={showcaseAlerts}
                center={showcaseAlertMapCenter}
                zoom={10}
                canClickAlerts={false}
                config={{
                  useGeolocateControl: { enabled: false },
                  useNavigationControl: {
                    enabled: true,
                    position: "top-right",
                  },
                  useScaleControl: { enabled: false },
                  useStyleSwitcher: { enabled: false },
                }}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(3,7,18,0.18)_55%,rgba(3,7,18,0.52)_100%)]" />

            {mapMarkers.map((marker, index) => {
              const markerProgress = clamp01(
                (beatProgress - index * 0.08) / 0.45,
              );
              const size = 42 + markerProgress * 28;

              return (
                <motion.div
                  key={marker.id}
                  className="pointer-events-none absolute"
                  style={{
                    left: marker.left,
                    top: marker.top,
                    transform: "translate(-50%, -50%)",
                    opacity: 0.25 + markerProgress * 0.5,
                  }}
                >
                  <div
                    className="bg-cyan-300/18 rounded-full border border-cyan-300/45"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="space-y-4">
          {showcaseAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={false}
              animate={{
                opacity: clamp01((beatProgress - 0.18 - index * 0.08) / 0.2),
                x:
                  36 - clamp01((beatProgress - 0.18 - index * 0.08) / 0.2) * 36,
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <AlertCard
                alert={alert}
                compact={index > 0}
                showFull={index === 0}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShowcaseVideoHeader() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent px-4 pb-8 pt-5">
      <div className="flex items-center gap-3">
        <div className="flex w-full items-center gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1 text-sm text-white backdrop-blur">
          <div className="flex-1 rounded-full bg-white px-4 py-1.5 text-center font-medium text-slate-900">
            For You
          </div>
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-slate-200">
            <Users className="h-4 w-4" />
            Following
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseVideoCard({
  video,
  isActive,
  shadowBoost = 0,
  compactSidebar = false,
}: {
  video: (typeof showcaseVideos)[number];
  isActive: boolean;
  shadowBoost?: number;
  compactSidebar?: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[30px] border border-white/10 bg-slate-950 shadow-[0_40px_100px_rgba(3,7,18,0.5)]">
      <ShowcaseVideoHeader />

      {video.playbackUrl ? (
        <VideoPlayer
          src={video.playbackUrl}
          poster={video.thumbnailUrl ?? undefined}
          isActive={isActive}
          isMuted={true}
          className="h-full w-full"
        />
      ) : (
        <img
          src={video.thumbnailUrl ?? "/galileyo-mobile-poster.jpg"}
          alt=""
          className="h-full w-full object-cover"
        />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: `inset 0 -${120 + shadowBoost}px ${180 + shadowBoost * 1.2}px rgba(2, 6, 23, 0.88)`,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
          <VideoInfo
            creator={video.creator}
            caption={video.caption}
            viewCount={video.viewCount}
            isFollowing={video.isFollowing}
            currentUserId={0}
            interactive={false}
          />

          <div className={cn("hidden sm:flex", compactSidebar && "opacity-95")}>
            <VideoSidebar
              videoId={video.id}
              likeCount={video.likeCount}
              commentCount={video.commentCount}
              shareCount={video.shareCount ?? 0}
              isLiked={video.isLiked ?? false}
              isShared={video.isShared ?? false}
              isSaved={video.isSaved}
              userReactionId={video.userReactionId}
              reactions={video.reactions}
              allowSharing={video.allowSharing ?? true}
              videoCaption={video.caption}
              thumbnailUrl={video.thumbnailUrl ?? undefined}
              creatorName={video.creator.name}
              creatorImage={video.creator.image}
              interactive={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseVideoSurface({
  beat,
  beatProgress,
  isTransitioning,
}: {
  beat: FeatureShowcaseBeat;
  beatProgress: number;
  isTransitioning: boolean;
}) {
  if (beat.id === "video-swipe") {
    const swipeProgress = clamp01((beatProgress - 0.08) / 0.42);
    const stackTranslate = swipeProgress * 100;

    return (
      <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_34%),linear-gradient(180deg,#070d15_0%,#05080f_100%)]">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center px-4 py-6 lg:px-8 lg:py-8">
          <div className="border-white/12 relative h-full min-h-[360px] w-full overflow-hidden rounded-[34px] border bg-slate-950/80 p-3 shadow-[0_40px_120px_rgba(3,7,18,0.65)] backdrop-blur-md lg:min-h-[620px]">
            <motion.div
              className="h-full"
              style={{
                transform: `translateY(-${stackTranslate}%)`,
              }}
            >
              {[getShowcaseVideo(0), getShowcaseVideo(1)].map(
                (video, index) => (
                  <div key={video.id} className="h-full pb-3 last:pb-0">
                    <ShowcaseVideoCard
                      video={video}
                      isActive={
                        index === 0
                          ? swipeProgress < 0.52
                          : swipeProgress >= 0.52
                      }
                      shadowBoost={18}
                      compactSidebar={true}
                    />
                  </div>
                ),
              )}
            </motion.div>

            <div className="pointer-events-none absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-slate-300 shadow-lg backdrop-blur lg:block">
              Swipe progression
            </div>
          </div>
        </div>
      </div>
    );
  }

  const video = getShowcaseVideo(0);
  const settleProgress = clamp01((beatProgress - 0.08) / 0.5);
  const scale = 0.965 + settleProgress * 0.035;
  const translateY = 24 - settleProgress * 24;

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_28%),linear-gradient(180deg,#070d15_0%,#05080f_100%)]">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center px-4 py-6 lg:px-8 lg:py-8">
        <motion.div
          className="border-white/12 relative h-full min-h-[360px] w-full rounded-[34px] border bg-slate-950/70 p-3 shadow-[0_40px_120px_rgba(3,7,18,0.65)] backdrop-blur-md lg:min-h-[620px]"
          style={{
            transform: `translateY(${translateY}px) scale(${scale})`,
            opacity: isTransitioning ? 0.96 : 1,
          }}
        >
          <ShowcaseVideoCard video={video} isActive={true} shadowBoost={24} />
        </motion.div>
      </div>
    </div>
  );
}

function ShowcaseChatSurface({ beatProgress }: { beatProgress: number }) {
  const settleProgress = clamp01((beatProgress - 0.08) / 0.38);
  const pulseProgress = clamp01((beatProgress - 0.56) / 0.18);

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.14),transparent_36%),linear-gradient(180deg,#07101a_0%,#05080f_100%)]">
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center px-4 py-6 lg:px-8 lg:py-8">
        <motion.div
          className="border-cyan-300/12 bg-slate-950/78 relative flex h-full min-h-[360px] w-full flex-col overflow-hidden rounded-[34px] border shadow-[0_40px_120px_rgba(3,7,18,0.6)] backdrop-blur-md lg:min-h-[620px]"
          style={{
            transform: `translateX(${20 - settleProgress * 20}px) scale(${0.97 + settleProgress * 0.03})`,
          }}
        >
          <div className="bg-slate-950/84 flex items-center gap-3 border-b border-white/10 px-4 py-4 backdrop-blur-md sm:px-5">
            <UserAvatar
              name={showcaseChatConversation.participant.name}
              image={showcaseChatConversation.participant.image}
              isVerified={true}
              isInfluencer={true}
              size="small"
              onlyAvatar={true}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-50 sm:text-base">
                {showcaseChatConversation.participant.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                {showcaseChatConversation.participant.status}
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-cyan-300/8 border-cyan-300/15 text-cyan-100"
            >
              Coordination
            </Badge>
          </div>

          <div className="relative flex-1 overflow-hidden px-4 py-5 sm:px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_35%)]" />
            <div className="relative flex h-full flex-col justify-center gap-3">
              {showcaseChatConversation.messages.map((message, index) => {
                const reveal = clamp01(
                  (beatProgress - 0.14 - index * 0.07) / 0.18,
                );
                const isMine = message.sender === "me";
                const isLastIncoming =
                  !isMine &&
                  index === showcaseChatConversation.messages.length - 2;

                return (
                  <motion.div
                    key={message.id}
                    className={cn(
                      "flex",
                      isMine ? "justify-end" : "justify-start",
                    )}
                    initial={false}
                    animate={{
                      opacity: reveal,
                      x: isMine ? 12 - reveal * 12 : -12 + reveal * 12,
                      scale: isLastIncoming ? 1 + pulseProgress * 0.02 : 1,
                    }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] rounded-[24px] px-4 py-3 shadow-lg sm:max-w-[72%]",
                        isMine
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-white/6 border border-white/10 text-slate-100 backdrop-blur",
                      )}
                    >
                      <p className="text-sm leading-relaxed sm:text-[15px]">
                        {message.text}
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-[11px] uppercase tracking-[0.18em]",
                          isMine ? "text-slate-800/70" : "text-slate-400",
                        )}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/82 border-t border-white/10 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
              <Button
                variant="ghost"
                size="icon"
                disabled={true}
                className="size-9 shrink-0 rounded-full text-slate-300 disabled:opacity-100"
              >
                <SmilePlus className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1 rounded-xl bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                {showcaseChatConversation.draft}
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={true}
                className="gap-2 rounded-full px-4 disabled:opacity-100"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ShowcaseNotificationSurface({
  beatProgress,
}: {
  beatProgress: number;
}) {
  const cardLift = -2 * clamp01((beatProgress - 0.56) / 0.2);

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,#070d15_0%,#05080f_100%)]">
      <div className="mx-auto flex h-full w-full max-w-[980px] items-center px-4 py-6 lg:px-8 lg:py-8">
        <motion.div
          className="border-red-300/12 relative h-full min-h-[360px] w-full overflow-hidden rounded-[34px] border bg-slate-950/80 shadow-[0_40px_120px_rgba(3,7,18,0.65)] backdrop-blur-md lg:min-h-[620px]"
          style={{
            transform: `translateY(${cardLift}px)`,
          }}
        >
          <div className="bg-slate-950/82 border-b border-white/10 px-4 py-4 backdrop-blur-md sm:px-5">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/12 flex h-10 w-10 items-center justify-center rounded-2xl text-red-200">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-50 sm:text-base">
                  Notifications
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Live activity across your network
                </p>
              </div>
              <Badge className="border border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/10">
                2 unread
              </Badge>
            </div>
          </div>

          <div className="relative flex-1 space-y-3 px-4 py-5 sm:px-5">
            {showcaseNotifications.map((notification, index) => {
              const reveal = clamp01(
                (beatProgress - 0.12 - index * 0.07) / 0.18,
              );
              const unreadPulse = notification.unread
                ? 1 + Math.sin(beatProgress * Math.PI * 5) * 0.08
                : 1;
              const icon = (() => {
                switch (notification.type) {
                  case "alert":
                    return <AlertTriangle className="h-4 w-4 text-red-200" />;
                  case "comment":
                    return <MessageCircle className="h-4 w-4 text-cyan-200" />;
                  case "follow":
                    return <UserPlus className="h-4 w-4 text-emerald-200" />;
                  case "invite":
                    return <Users className="h-4 w-4 text-fuchsia-200" />;
                  case "system":
                    return <ShieldCheck className="h-4 w-4 text-amber-200" />;
                }
              })();

              return (
                <motion.div
                  key={notification.id}
                  initial={false}
                  animate={{
                    opacity: reveal,
                    y: 18 - reveal * 18,
                  }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={cn(
                    "rounded-[24px] border px-4 py-3 shadow-lg backdrop-blur",
                    notification.unread
                      ? "border-red-300/18 bg-red-400/8"
                      : "border-white/10 bg-white/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900/70">
                      {icon}
                      {notification.unread ? (
                        <motion.span
                          className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-400"
                          style={{ scale: unreadPulse }}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-slate-100">
                          {notification.title}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          {notification.timestamp}
                        </p>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-300">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {notification.actor.name}
                      </p>
                    </div>
                    {notification.type === "comment" ? (
                      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-red-300/80" />
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ShowcasePrivateFeedsSurface({
  beatProgress,
}: {
  beatProgress: number;
}) {
  const tableColumns = [
    "Private Feed",
    "Members",
    "Updated",
    "Access",
    "Actions",
  ];

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_32%),linear-gradient(180deg,#070d15_0%,#05080f_100%)]">
      <div className="mx-auto flex h-full w-full max-w-[1320px] flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
        <div className="feature-showcase-private-stats grid grid-cols-1 gap-4 md:grid-cols-2">
          <PrivateFeedStatsCards
            data={showcasePrivateFeedStats}
            isLoading={false}
          />
        </div>

        <motion.div
          className="feature-showcase-private-table"
          initial={false}
          animate={{
            opacity: clamp01((beatProgress - 0.14) / 0.2),
            y: 24 - clamp01((beatProgress - 0.14) / 0.2) * 24,
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Card className="border-white/10 bg-slate-950/70 shadow-[0_28px_90px_rgba(3,7,18,0.55)] backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-white/10">
              <CardTitle className="text-slate-50">Private Feeds</CardTitle>
              <div className="ml-auto flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-cyan-300/8 border-cyan-300/15 text-cyan-100"
                >
                  Trusted coordination
                </Badge>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={true}
                  className="gap-2 disabled:opacity-100"
                >
                  <Plus className="h-4 w-4" />
                  Create New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    {tableColumns.map((column) => (
                      <TableHead key={column} className="text-slate-300">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showcasePrivateFeedRows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={false}
                      animate={{
                        opacity: clamp01(
                          (beatProgress - 0.2 - index * 0.07) / 0.16,
                        ),
                        transform: `translateY(${18 - clamp01((beatProgress - 0.2 - index * 0.07) / 0.16) * 18}px)`,
                      }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="border-white/10 bg-transparent"
                    >
                      <TableCell className="py-4">
                        <UserAvatar
                          name={row.title}
                          image={row.image ?? null}
                          isVerified={false}
                          isInfluencer={false}
                          size="small"
                        >
                          <span className="line-clamp-2 max-w-xs text-sm text-slate-400">
                            {row.description ?? "No description"}
                          </span>
                        </UserAvatar>
                      </TableCell>
                      <TableCell className="text-slate-100">
                        {row.members}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {row.updatedAt}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-white/10 bg-white/5 text-slate-100"
                        >
                          {row.access}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={true}
                            className="gap-2 border-white/10 bg-white/5 text-slate-100 disabled:opacity-100"
                          >
                            <Mail className="h-4 w-4" />
                            Invite
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={true}
                            className="gap-2 border-white/10 bg-white/5 text-slate-100 disabled:opacity-100"
                          >
                            <Users className="h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export function FeatureShowcaseSurface({
  beat,
  phase,
  beatProgress,
  phaseProgress,
  isTransitioning,
}: {
  beat: FeatureShowcaseBeat;
  phase: FeatureShowcaseBeatPhase;
  beatProgress: number;
  phaseProgress: number;
  isTransitioning: boolean;
}) {
  const introLift = phase === "intro" ? 20 - phaseProgress * 20 : 0;
  const outroFade = phase === "outro" ? 1 - phaseProgress * 0.2 : 1;

  return (
    <motion.div
      className="h-full"
      style={{
        transform: `translateY(${introLift}px)`,
        opacity: outroFade,
      }}
    >
      {beat.surface === "feed" ? (
        <ShowcaseFeedSurface beatProgress={beatProgress} />
      ) : null}
      {beat.surface === "alert-map" ? (
        <ShowcaseAlertsMapSurface beatProgress={beatProgress} />
      ) : null}
      {beat.surface === "video" ? (
        <ShowcaseVideoSurface
          beat={beat}
          beatProgress={beatProgress}
          isTransitioning={isTransitioning}
        />
      ) : null}
      {beat.surface === "chat" ? (
        <ShowcaseChatSurface beatProgress={beatProgress} />
      ) : null}
      {beat.surface === "private-feeds" ? (
        <ShowcasePrivateFeedsSurface beatProgress={beatProgress} />
      ) : null}
      {beat.surface === "notifications" ? (
        <ShowcaseNotificationSurface beatProgress={beatProgress} />
      ) : null}
    </motion.div>
  );
}

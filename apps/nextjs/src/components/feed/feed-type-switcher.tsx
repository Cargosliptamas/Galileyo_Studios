"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Sparkles, Users, Video } from "lucide-react";
import { useQueryState } from "nuqs";

import { cn } from "@galileyo/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

import type { User } from "~/auth/client";
import { VideoUpload } from "~/components/video/video-upload";
import { CreatePostInput } from "./create-post-input";
import FeedCardSkeleton from "./feed-card-skeleton";
import FeedList from "./feed-list";
import { FeedSettingsDialog } from "./feed-settings-dialog";

interface TabItem {
  id: string;
  label: string;
  icon: typeof Users;
  isAction?: boolean;
  gradient?: string;
}

interface FeedTypeSwitcherProps {
  user?: User;
  initialPostId?: number;
  mockedContent?: Partial<Record<string, React.ReactNode>>;
  initialActiveTab?: string;
  showCreatePostInput?: boolean;
  disableActionTabs?: boolean;
}

const tabs: TabItem[] = [
  {
    id: "subscriptions",
    label: "Following",
    icon: Users,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "discover",
    label: "Discover",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  // {
  //   id: "upload",
  //   label: "Upload",
  //   icon: Video,
  //   isAction: true,
  //   gradient: "from-emerald-500 to-teal-500",
  // },
  {
    id: "videos",
    label: "Videos",
    icon: Video,
    isAction: true,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    isAction: true,
    gradient: "from-slate-500 to-slate-600",
  },
];

export function FeedTypeSwitcher({
  user,
  initialPostId,
  mockedContent,
  initialActiveTab,
  showCreatePostInput = true,
  disableActionTabs = false,
}: FeedTypeSwitcherProps) {
  const router = useRouter();

  const [tabState, setTabState] = useQueryState("tab");
  const [showSettings, setShowSettings] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const isMocked = Boolean(mockedContent);
  const defaultTab = initialActiveTab ?? tabState ?? "subscriptions";
  const [activeTab, setActiveTab] = useState(() => defaultTab);
  const activeMockedContent = useMemo(
    () => mockedContent?.[activeTab] ?? null,
    [activeTab, mockedContent],
  );

  const handleTabClick = (tab: TabItem) => {
    if (disableActionTabs && tab.isAction) {
      return;
    }

    // if (tab.id === "upload") {
    //   setShowVideoUpload(true);
    // } else if (tab.id === "settings") {
    //   setShowSettings(true);
    // } else {
    //   setActiveTab(tab.id);
    //   void setTabState(tab.id);
    // }

    switch (tab.id) {
      case "upload":
        setShowVideoUpload(true);
        break;
      case "settings":
        setShowSettings(true);
        break;
      case "videos":
        if (!isMocked) {
          router.push("/videos");
        }
        break;
      default:
        setActiveTab(tab.id);
        if (!isMocked) {
          void setTabState(tab.id);
        }
        break;
    }
  };

  if (!isMocked && !user) {
    throw new Error("FeedTypeSwitcher requires a user outside mocked mode.");
  }

  if (isMocked) {
    return (
      <div>
        <nav className="mb-6">
          <div className="flex items-center justify-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = !tab.isAction && activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  disabled={disableActionTabs && tab.isAction}
                  className={cn(
                    "group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-200 sm:px-4",
                    isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                    tab.isAction && "text-slate-500 dark:text-slate-500",
                    disableActionTabs &&
                      tab.isAction &&
                      "cursor-default opacity-60 hover:bg-transparent dark:hover:bg-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                      isActive && "text-white",
                    )}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <span
                      className={cn(
                        "absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r opacity-60",
                        tab.gradient,
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="space-y-4">{activeMockedContent}</div>
      </div>
    );
  }

  if (!user) {
    throw new Error("FeedTypeSwitcher requires a user outside mocked mode.");
  }

  const liveUser = user;

  return (
    <div>
      {/* Tab Bar */}
      <nav className="mb-6">
        <div className="flex items-center justify-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = !tab.isAction && activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                disabled={disableActionTabs && tab.isAction}
                className={cn(
                  "group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-200 sm:px-4",
                  isActive
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  tab.isAction && "text-slate-500 dark:text-slate-500",
                  disableActionTabs &&
                    tab.isAction &&
                    "cursor-default opacity-60 hover:bg-transparent dark:hover:bg-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                    isActive && "text-white",
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <span
                    className={cn(
                      "absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r opacity-60",
                      tab.gradient,
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <div className="space-y-4">
        {showCreatePostInput ? <CreatePostInput user={liveUser} /> : null}

        <Suspense
          fallback={
            <div className="space-y-4">
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
            </div>
          }
        >
          <FeedList
            activeTab={activeTab}
            user={liveUser}
            initialPostId={initialPostId}
          />
        </Suspense>
      </div>

      {/* Dialogs */}
      <FeedSettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      <Dialog open={showVideoUpload} onOpenChange={setShowVideoUpload}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-1rem)] max-w-md overflow-hidden p-0">
          <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
            <DialogTitle>Upload Video</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90dvh-64px)] overflow-y-auto p-4 sm:p-6">
            <VideoUpload
              onUploadComplete={() => {
                setShowVideoUpload(false);
              }}
              onCancel={() => setShowVideoUpload(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

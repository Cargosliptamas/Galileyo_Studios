"use client";

import { Suspense, useState } from "react";
import { Settings, Sparkles, Users } from "lucide-react";
import { useQueryState } from "nuqs";

import { Button } from "@galileyo/ui";
import { Tabs, TabsList, TabsTrigger } from "@galileyo/ui/tabs";

import type { User } from "~/auth/client";
import { CreatePostInput } from "./create-post-input";
import FeedCardSkeleton from "./feed-card-skeleton";
import FeedList from "./feed-list";
import { FeedSettingsDialog } from "./feed-settings-dialog";

export function FeedTypeSwitcher({ user }: { user: User }) {
  const [tabState, setTabState] = useQueryState("tab");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(() => tabState ?? "subscriptions");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    void setTabState(tab);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-2">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="col-span-11 mb-4 w-full"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-xl border border-slate-200 bg-white/50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
            <TabsTrigger
              value="subscriptions"
              className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
            >
              <Users className="mr-2 h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Discover
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="col-span-1"
        >
          <Settings className="h-4 w-4" />
          <span className="ml-2 md:hidden">Settings</span>
        </Button>
      </div>

      <CreatePostInput user={user} />

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
        <FeedList activeTab={activeTab} user={user} />
      </Suspense>

      <FeedSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}

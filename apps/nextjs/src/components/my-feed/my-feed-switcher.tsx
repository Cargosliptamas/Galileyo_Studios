"use client";

import { useState } from "react";

import { cn } from "@galileyo/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";

import { MyInfluencerFeeds } from "./my-influencer-feeds";
import { MyPrivateFeeds } from "./my-private-feeds";

export function MyFeedSwitcher({ isInfluencer }: { isInfluencer: boolean }) {
  const [activeTab, setActiveTab] = useState(() =>
    isInfluencer ? "influencer" : "private",
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={cn(
            "mb-8 grid w-full rounded-xl border border-slate-200 bg-white/50 p-1 dark:border-slate-700 dark:bg-slate-800/50",
            isInfluencer ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {isInfluencer ? (
            <TabsTrigger
              value="influencer"
              className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
            >
              Influencer Feeds
            </TabsTrigger>
          ) : null}
          <TabsTrigger
            value="private"
            className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
          >
            Private Feeds
          </TabsTrigger>
        </TabsList>

        {isInfluencer ? (
          <TabsContent value="influencer" className="space-y-6">
            <MyInfluencerFeeds />
          </TabsContent>
        ) : null}

        <TabsContent value="private" className="space-y-6">
          <MyPrivateFeeds />
        </TabsContent>
      </Tabs>
    </div>
  );
}

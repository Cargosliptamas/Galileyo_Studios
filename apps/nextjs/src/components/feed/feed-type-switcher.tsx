"use client";

import { Suspense, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { SaveIcon, Settings, Sparkles, Users } from "lucide-react";
import { useQueryState } from "nuqs";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  toast,
} from "@galileyo/ui";
import { Tabs, TabsList, TabsTrigger } from "@galileyo/ui/tabs";

import type { User } from "~/auth/client";
import { useTRPC } from "~/trpc/react";
import { CreatePostInput } from "./create-post-input";
import FeedCardSkeleton from "./feed-card-skeleton";
import FeedList from "./feed-list";

export function FeedTypeSwitcher({ user }: { user: User }) {
  const [zipCodes, setZipCodes] = useState<Record<string, string>>({});
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>(
    {},
  );

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [tabState, setTabState] = useQueryState("tab");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(() => tabState ?? "subscriptions");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    void setTabState(tab);
  };

  const { data: subscribeableFeeds } = useSuspenseQuery(
    trpc.feed.getSubscribeableFeeds.queryOptions(),
  );

  const subscriptionMutation = useMutation(
    trpc.feed.setSubscription.mutationOptions({
      onSuccess: () => {
        toast.success("Subscription updated");
        void queryClient.invalidateQueries(trpc.feed.pathFilter());
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    }),
  );

  const handleSubscriptionChange = ({
    id,
    checked,
    needZip = false,
    zip,
  }: {
    id: string;
    checked: boolean;
    needZip?: boolean;
    zip?: string | null;
  }) => {
    if (needZip && !zip) {
      toast.error("Please enter a zip code");
      return;
    }

    subscriptionMutation.mutate({
      id: Number(id),
      subscribed: checked,
      zip: zip ?? undefined,
    });
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

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="h-auto max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Accordion type="single" className="w-full" collapsible>
                {subscribeableFeeds.map((feed, index) => (
                  <AccordionItem value={`${feed.id}-${index}`}>
                    <AccordionTrigger>
                      <div className="mr-2 flex w-full items-center justify-between">
                        <p>{feed.title}</p>
                        <p>
                          {feed.feeds.length} /{" "}
                          {feed.feeds.filter((item) => item.checked).length}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {feed.feeds.map((item, itemIndex) => (
                        <div
                          key={`${feed.id}-${index}-${itemIndex}-${item.id}`}
                          className="flex w-full flex-col gap-2 md:flex-row md:items-center md:p-2"
                        >
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.description}
                          </span>
                          <div className="flex items-center gap-2 md:flex-1 md:justify-end">
                            {item.need_zip && (
                              <Input
                                className="w-full md:w-auto"
                                type="text"
                                placeholder="Zip code"
                                value={zipCodes[item.id] ?? item.zip ?? ""}
                                onChange={(e) => {
                                  setZipCodes((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }));
                                }}
                              />
                            )}
                            <Checkbox
                              className="h-5 w-5"
                              checked={checkedStates[item.id] ?? item.checked}
                              onCheckedChange={(checked: boolean) => {
                                setCheckedStates((prev) => ({
                                  ...prev,
                                  [item.id]: checked,
                                }));
                              }}
                            />
                            <Button
                              size="icon"
                              onClick={() => {
                                handleSubscriptionChange({
                                  id: item.id,
                                  checked:
                                    checkedStates[item.id] ?? item.checked,
                                  needZip: item.need_zip,
                                  zip: zipCodes[item.id] ?? item.zip,
                                });
                              }}
                            >
                              <SaveIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

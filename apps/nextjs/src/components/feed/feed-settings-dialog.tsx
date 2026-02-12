"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Input,
  Label,
  ScrollArea,
  ScrollBar,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@galileyo/ui";

import { useTRPC } from "~/trpc/react";

// ---------------------------------------------------------------------------
// Types (from API response)
// ---------------------------------------------------------------------------

interface SubscribeableFeedItemType {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  checked: boolean;
  need_zip: boolean;
  subscribers: number;
  is_custom: boolean;
  can_change_checked: boolean;
  is_public: boolean;
  image: string | null;
  zip?: string | null;
}

interface SubscribeableFeedType {
  id: string;
  title: string;
  is_customer_marketstack_indx: boolean;
  is_customer_marketstack_ticker: boolean;
  childs?: SubscribeableFeedType[];
  feeds?: SubscribeableFeedItemType[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const numberFormatter = new Intl.NumberFormat();

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return numberFormatter.format(count);
}

function getItemChecked(
  item: SubscribeableFeedItemType,
  overrides: Record<string, boolean>,
) {
  return overrides[item.id] ?? item.checked;
}

function searchTerm(needle: string, haystack: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function itemMatchesQuery(item: SubscribeableFeedItemType, query: string) {
  if (!query.trim()) return true;
  return (
    searchTerm(query, item.title) ||
    (item.subtitle ? searchTerm(query, item.subtitle) : false) ||
    (item.description ? searchTerm(query, item.description) : false)
  );
}

/** Flatten all feed items from the hierarchical tree. */
function collectAllItems(
  feeds: SubscribeableFeedType[] | undefined,
): SubscribeableFeedItemType[] {
  if (!feeds) return [];
  const items: SubscribeableFeedItemType[] = [];
  const walk = (node: SubscribeableFeedType) => {
    if (node.feeds) items.push(...node.feeds);
    node.childs?.forEach(walk);
  };
  feeds.forEach(walk);
  return items;
}

/** Collect items grouped by top-level category. */
function collectItemsByCategory(
  feeds: SubscribeableFeedType[] | undefined,
): Map<string, SubscribeableFeedItemType[]> {
  const map = new Map<string, SubscribeableFeedItemType[]>();
  if (!feeds) return map;
  for (const feed of feeds) {
    const items = collectAllItems([feed]);
    if (items.length > 0) {
      map.set(feed.title, items);
    }
  }
  return map;
}

/** Extract unique top-level category names. */
function collectCategories(
  feeds: SubscribeableFeedType[] | undefined,
): string[] {
  if (!feeds) return [];
  return feeds.map((f) => f.title).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Category pill navigation */
function CategoryPills({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}) {
  return (
    <nav aria-label="Feed categories">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            type="button"
            variant={selected === "all" ? "primary" : "secondary"}
            size="sm"
            onClick={() => onSelect("all")}
            className="shrink-0"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={selected === cat ? "primary" : "secondary"}
              size="sm"
              onClick={() => onSelect(cat)}
              className="shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </nav>
  );
}

/** Individual feed item card with Follow/Following toggle */
function FeedCard({
  item,
  isFollowing,
  onToggle,
  isPending,
  zipValue,
  onZipChange,
  showZipInput,
  onZipSave,
  onZipCancel,
  onEditZip,
}: {
  item: SubscribeableFeedItemType;
  isFollowing: boolean;
  onToggle: (item: SubscribeableFeedItemType, follow: boolean) => void;
  isPending: boolean;
  zipValue: string;
  onZipChange: (val: string) => void;
  showZipInput: boolean;
  onZipSave: () => void;
  onZipCancel: () => void;
  onEditZip: (item: SubscribeableFeedItemType) => void;
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="group border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 shrink-0">
          {item.image ? (
            <AvatarImage src={item.image} alt={item.title} />
          ) : null}
          <AvatarFallback className="bg-muted text-sm font-semibold">
            {item.title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-tight">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>

            {/* Follow / Following button */}
            <Button
              type="button"
              size="sm"
              variant={
                isFollowing
                  ? isHovering
                    ? "destructive"
                    : "outline"
                  : "primary"
              }
              disabled={isPending}
              onClick={() => onToggle(item, !isFollowing)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="shrink-0 gap-1.5"
            >
              {isFollowing ? (
                isHovering ? (
                  <>
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Following
                  </>
                )
              ) : (
                "Follow"
              )}
            </Button>
          </div>

          {/* Meta row: subtitle, subscriber count, zip badge */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {item.subscribers > 10 ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" aria-hidden="true" />
                <span className="tabular-nums">
                  {formatSubscribers(item.subscribers)}
                </span>
              </span>
            ) : null}
            {item.subtitle ? (
              <span className="text-xs text-muted-foreground">
                {item.subtitle}
              </span>
            ) : null}
            {item.need_zip && item.zip && !showZipInput ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditZip(item)}
                className="h-auto gap-1 px-1.5 py-0.5 text-xs font-normal text-muted-foreground hover:text-foreground"
                aria-label={`Change zip code for ${item.title}`}
              >
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {item.zip}
              </Button>
            ) : null}
            {item.need_zip && !item.zip && isFollowing && !showZipInput ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditZip(item)}
                className="h-auto gap-1 border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-xs font-normal text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                aria-label={`Add zip code for ${item.title}`}
              >
                <MapPin className="h-3 w-3" aria-hidden="true" />
                Zip required
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Inline zip code input */}
      {showZipInput ? (
        <div className="mt-3 flex items-center gap-2 border border-dashed border-primary/30 bg-primary/5 p-3">
          <MapPin
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <Label htmlFor={`zip-${item.id}`} className="sr-only">
              Zip code for {item.title}
            </Label>
            <Input
              id={`zip-${item.id}`}
              name="zipCode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="Enter zip code"
              value={zipValue}
              onChange={(e) => onZipChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onZipSave();
                if (e.key === "Escape") onZipCancel();
              }}
              spellCheck={false}
              maxLength={10}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <Button type="button" size="sm" onClick={onZipSave} className="h-8">
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onZipCancel}
            className="h-8"
            aria-label="Cancel zip code entry"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Compact card for the "You Might Also Like" horizontal row */
function SuggestionCard({
  item,
  onFollow,
  isPending,
}: {
  item: SubscribeableFeedItemType;
  onFollow: (item: SubscribeableFeedItemType) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex w-44 shrink-0 flex-col items-center gap-2.5 border bg-card p-4 text-center transition-shadow hover:shadow-md">
      <Avatar className="h-14 w-14">
        {item.image ? <AvatarImage src={item.image} alt={item.title} /> : null}
        <AvatarFallback className="bg-muted text-lg font-semibold">
          {item.title.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="w-full min-w-0">
        <p className="truncate text-sm font-medium">{item.title}</p>
        {item.subscribers > 0 ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {formatSubscribers(item.subscribers)}
            </span>{" "}
            subscribers
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() => onFollow(item)}
        className="h-7 w-full text-xs"
      >
        Follow
      </Button>
    </div>
  );
}

/** "You Might Also Like" horizontal scroll row */
function SuggestionsRow({
  suggestions,
  onFollow,
  pendingIds,
}: {
  suggestions: SubscribeableFeedItemType[];
  onFollow: (item: SubscribeableFeedItemType) => void;
  pendingIds: Set<string>;
}) {
  if (suggestions.length === 0) return null;

  return (
    <section aria-label="Suggested feeds">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold">You Might Also Like</h3>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-3">
          {suggestions.map((item) => (
            <SuggestionCard
              key={item.id}
              item={item}
              onFollow={onFollow}
              isPending={pendingIds.has(item.id)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

/** Loading skeleton for the sheet content */
function FeedSettingsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Category pills skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      {/* Card skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 border p-4">
          <Skeleton className="h-11 w-11" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Empty state */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="bg-muted p-3">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FeedSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>(
    {},
  );
  const [activeTab, setActiveTab] = useState("browse");

  // Zip code inline input state
  const [zipTargetId, setZipTargetId] = useState<string | null>(null);
  const [zipValue, setZipValue] = useState("");
  const [isEditingZip, setIsEditingZip] = useState(false);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedCategory("all");
      setCheckedStates({});
      setActiveTab("browse");
      setZipTargetId(null);
      setZipValue("");
      setIsEditingZip(false);
    }
  }, [open]);

  // ---- Data fetching ----
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: subscribeableFeeds, isLoading } = useQuery({
    ...trpc.feed.getSubscribeableFeeds.queryOptions(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

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

  // ---- Derived data ----

  const categories = useMemo(
    () => collectCategories(subscribeableFeeds),
    [subscribeableFeeds],
  );

  const itemsByCategory = useMemo(
    () => collectItemsByCategory(subscribeableFeeds),
    [subscribeableFeeds],
  );

  const allItems = useMemo(
    () => collectAllItems(subscribeableFeeds),
    [subscribeableFeeds],
  );

  /** Top unsubscribed feeds by subscriber count for "You Might Also Like" */
  const suggestions = useMemo(() => {
    return allItems
      .filter((item) => !getItemChecked(item, checkedStates))
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, 8);
  }, [allItems, checkedStates]);

  /** Filter items based on search + selected category */
  const getFilteredItems = useCallback(
    (onlySubscribed: boolean) => {
      let items: SubscribeableFeedItemType[];

      if (selectedCategory === "all") {
        items = allItems;
      } else {
        items = itemsByCategory.get(selectedCategory) ?? [];
      }

      if (onlySubscribed) {
        items = items.filter((item) => getItemChecked(item, checkedStates));
      }

      const query = searchQuery.trim();
      if (query) {
        items = items.filter((item) => itemMatchesQuery(item, query));
      }

      return items;
    },
    [allItems, itemsByCategory, selectedCategory, searchQuery, checkedStates],
  );

  const browseItems = useMemo(
    () => getFilteredItems(false),
    [getFilteredItems],
  );
  const followingItems = useMemo(
    () => getFilteredItems(true),
    [getFilteredItems],
  );

  /** Group following items by category for the "Following" tab */
  const followingByCategory = useMemo(() => {
    const map = new Map<string, SubscribeableFeedItemType[]>();
    for (const [category, items] of itemsByCategory) {
      const query = searchQuery.trim();
      const subscribed = items.filter((item) => {
        const isChecked = getItemChecked(item, checkedStates);
        const matchesSearch = query ? itemMatchesQuery(item, query) : true;
        return isChecked && matchesSearch;
      });
      if (subscribed.length > 0) {
        map.set(category, subscribed);
      }
    }
    return map;
  }, [itemsByCategory, checkedStates, searchQuery]);

  const totalSubscribed = useMemo(
    () => allItems.filter((item) => getItemChecked(item, checkedStates)).length,
    [allItems, checkedStates],
  );

  // ---- Handlers ----

  const handleSubscriptionChange = useCallback(
    ({
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
      if (needZip && checked && !zip) {
        toast.error("Please enter a zip code");
        return;
      }
      subscriptionMutation.mutate({
        id: Number(id),
        subscribed: checked,
        zip: zip ?? undefined,
      });
    },
    [subscriptionMutation],
  );

  const handleToggle = useCallback(
    (item: SubscribeableFeedItemType, follow: boolean) => {
      setCheckedStates((prev) => ({ ...prev, [item.id]: follow }));

      if (follow && item.need_zip && !item.zip) {
        // Open inline zip input for a new subscription
        setZipTargetId(item.id);
        setZipValue("");
        setIsEditingZip(false);
        return;
      }

      handleSubscriptionChange({
        id: item.id,
        checked: follow,
        needZip: item.need_zip,
        zip: item.zip,
      });
    },
    [handleSubscriptionChange],
  );

  const handleEditZip = useCallback((item: SubscribeableFeedItemType) => {
    setZipTargetId(item.id);
    setZipValue(item.zip ?? "");
    setIsEditingZip(true);
  }, []);

  const handleZipSave = useCallback(() => {
    if (!zipTargetId) return;
    if (!zipValue.trim()) {
      toast.error("Please enter a zip code");
      return;
    }
    handleSubscriptionChange({
      id: zipTargetId,
      checked: true,
      needZip: true,
      zip: zipValue.trim(),
    });
    setZipTargetId(null);
    setZipValue("");
    setIsEditingZip(false);
  }, [zipTargetId, zipValue, handleSubscriptionChange]);

  const handleZipCancel = useCallback(() => {
    // Only revert the checkbox if this was a fresh subscribe (not editing existing zip)
    if (zipTargetId && !isEditingZip) {
      setCheckedStates((prev) => ({ ...prev, [zipTargetId]: false }));
    }
    setZipTargetId(null);
    setZipValue("");
    setIsEditingZip(false);
  }, [zipTargetId, isEditingZip]);

  const handleSuggestionFollow = useCallback(
    (item: SubscribeableFeedItemType) => {
      handleToggle(item, true);
    },
    [handleToggle],
  );

  // ---- Render ----

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg md:max-w-xl"
      >
        {/* Header */}
        <SheetHeader className="space-y-3 border-b px-5 pb-4 pt-6">
          <div>
            <SheetTitle className="text-balance text-lg">
              Manage Subscriptions
            </SheetTitle>
            <SheetDescription className="mt-1">
              <span className="tabular-nums">
                {numberFormatter.format(totalSubscribed)}
              </span>{" "}
              of{" "}
              <span className="tabular-nums">
                {numberFormatter.format(allItems.length)}
              </span>{" "}
              feeds followed
            </SheetDescription>
          </div>

          {/* Search */}
          <div className="relative">
            <Label htmlFor="feed-search" className="sr-only">
              Search feeds
            </Label>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="feed-search"
              name="feedSearch"
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="Search feeds, topics & descriptions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled={isLoading}
              spellCheck={false}
            />
          </div>
        </SheetHeader>

        {/* Body */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b px-5 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="browse" className="flex-1 gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="following" className="flex-1 gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Following
                {totalSubscribed > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums"
                  >
                    {totalSubscribed}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ============ Browse Tab ============ */}
          <TabsContent
            value="browse"
            className="mt-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="space-y-5 px-5 py-4">
              {isLoading ? (
                <FeedSettingsSkeleton />
              ) : (
                <>
                  {/* Suggestions row */}
                  {!searchQuery.trim() && selectedCategory === "all" ? (
                    <>
                      <SuggestionsRow
                        suggestions={suggestions}
                        onFollow={handleSuggestionFollow}
                        pendingIds={
                          new Set(
                            subscriptionMutation.isPending
                              ? [String(subscriptionMutation.variables.id)]
                              : [],
                          )
                        }
                      />
                      {suggestions.length > 0 ? <Separator /> : null}
                    </>
                  ) : null}

                  {/* Category pills */}
                  {categories.length > 1 ? (
                    <CategoryPills
                      categories={categories}
                      selected={selectedCategory}
                      onSelect={setSelectedCategory}
                    />
                  ) : null}

                  {/* Feed cards */}
                  {browseItems.length > 0 ? (
                    <div className="space-y-3">
                      {browseItems.map((item) => (
                        <FeedCard
                          key={item.id}
                          item={item}
                          isFollowing={getItemChecked(item, checkedStates)}
                          onToggle={handleToggle}
                          isPending={
                            subscriptionMutation.isPending &&
                            String(subscriptionMutation.variables.id) ===
                              item.id
                          }
                          zipValue={zipTargetId === item.id ? zipValue : ""}
                          onZipChange={setZipValue}
                          showZipInput={zipTargetId === item.id}
                          onZipSave={handleZipSave}
                          onZipCancel={handleZipCancel}
                          onEditZip={handleEditZip}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No Feeds Found"
                      description="Try adjusting your search or category filter."
                      action={
                        searchQuery.trim() || selectedCategory !== "all" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedCategory("all");
                            }}
                          >
                            Clear Filters
                          </Button>
                        ) : undefined
                      }
                    />
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* ============ Following Tab ============ */}
          <TabsContent
            value="following"
            className="mt-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="space-y-5 px-5 py-4">
              {isLoading ? (
                <FeedSettingsSkeleton />
              ) : followingItems.length > 0 ? (
                <>
                  {Array.from(followingByCategory).map(([category, items]) => (
                    <section key={category} aria-label={category}>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {category}
                        <Badge
                          variant="secondary"
                          className="h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums"
                        >
                          {items.length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <FeedCard
                            key={item.id}
                            item={item}
                            isFollowing={getItemChecked(item, checkedStates)}
                            onToggle={handleToggle}
                            isPending={
                              subscriptionMutation.isPending &&
                              String(subscriptionMutation.variables.id) ===
                                item.id
                            }
                            zipValue={zipTargetId === item.id ? zipValue : ""}
                            onZipChange={setZipValue}
                            showZipInput={zipTargetId === item.id}
                            onZipSave={handleZipSave}
                            onZipCancel={handleZipCancel}
                            onEditZip={handleEditZip}
                          />
                        ))}
                      </div>
                      <Separator className="mt-5" />
                    </section>
                  ))}
                </>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No Subscriptions Yet"
                  description="Browse feeds and follow the ones that interest you."
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("browse")}
                    >
                      <TrendingUp
                        className="mr-1.5 h-4 w-4"
                        aria-hidden="true"
                      />
                      Browse Feeds
                    </Button>
                  }
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

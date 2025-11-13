"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SaveIcon, Search } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Skeleton,
  toast,
} from "@galileyo/ui";

import { useTRPC } from "~/trpc/react";

// import { fuzzySearch } from "~/lib/fuzzy-search";

// Type inferred from the API response
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

function searchTerm(needle: string, haystack: string) {
  // return fuzzySearch(needle, haystack);
  const term = needle.toLowerCase();
  const searchTerm = haystack.toLowerCase();

  return searchTerm.includes(term);
}

interface FeedInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedItem: {
    id: string;
    title: string;
    description: string | null;
    need_zip: boolean;
    zip?: string | null;
  } | null;
  onSave: (zip: string) => void;
}

function FeedInputDialog({
  open,
  onOpenChange,
  feedItem,
  onSave,
}: FeedInputDialogProps) {
  const [zip, setZip] = useState(feedItem?.zip ?? "");

  const handleSave = () => {
    if (feedItem?.need_zip && !zip.trim()) {
      toast.error("Please enter a zip code");
      return;
    }
    onSave(zip);
    onOpenChange(false);
  };

  // Reset zip when dialog opens/closes or feedItem changes
  useEffect(() => {
    if (open && feedItem) {
      setZip(feedItem.zip ?? "");
    }
  }, [open, feedItem]);

  if (!feedItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{feedItem.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {feedItem.description && (
            <p className="text-sm text-muted-foreground">
              {feedItem.description}
            </p>
          )}
          {feedItem.need_zip && (
            <div className="space-y-2">
              <Label htmlFor="zip-code">Zip Code</Label>
              <Input
                id="zip-code"
                type="text"
                placeholder="Enter zip code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  }
                }}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FeedSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>(
    {},
  );
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [selectedFeedItem, setSelectedFeedItem] = useState<{
    id: string;
    title: string;
    description: string | null;
    need_zip: boolean;
    zip?: string | null;
  } | null>(null);
  const wasSavedRef = useRef(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: subscribeableFeeds, isLoading } = useQuery({
    ...trpc.feed.getSubscribeableFeeds.queryOptions(),
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  // Helper function to count all feeds recursively (including child feeds)
  const countAllFeeds = (feed: SubscribeableFeedType): number => {
    let count = feed.feeds?.length ?? 0;
    if (feed.childs) {
      count += feed.childs.reduce(
        (sum: number, child: SubscribeableFeedType) =>
          sum + countAllFeeds(child),
        0,
      );
    }
    return count;
  };

  // Helper function to count checked feeds recursively
  const countCheckedFeeds = (feed: SubscribeableFeedType): number => {
    let count =
      feed.feeds?.filter((item: SubscribeableFeedItemType) => item.checked)
        .length ?? 0;
    if (feed.childs) {
      count += feed.childs.reduce(
        (sum: number, child: SubscribeableFeedType) =>
          sum + countCheckedFeeds(child),
        0,
      );
    }
    return count;
  };

  // Helper function to filter child feeds recursively
  const filterChildFeeds = (
    child: SubscribeableFeedType,
    query: string,
  ): SubscribeableFeedType | null => {
    const matchesTitle = searchTerm(query, child.title);
    const matchingItems = child.feeds?.filter(
      (item: SubscribeableFeedItemType) =>
        searchTerm(query, item.title) ||
        ((item.description && searchTerm(query, item.description)) ??
          (item.subtitle && searchTerm(query, item.subtitle))),
    );

    const filteredChilds = child.childs
      ?.map((c: SubscribeableFeedType) => filterChildFeeds(c, query))
      .filter(
        (c: SubscribeableFeedType | null): c is SubscribeableFeedType =>
          c !== null,
      );

    if (matchesTitle) {
      return child;
    }

    if (matchingItems && matchingItems.length > 0) {
      return {
        ...child,
        feeds: matchingItems,
        childs: filteredChilds,
      };
    }

    if (filteredChilds && filteredChilds.length > 0) {
      return {
        ...child,
        childs: filteredChilds,
      };
    }

    return null;
  };

  // Helper function to collect all accordion keys recursively
  // This matches the key generation pattern used in renderChildFeeds
  const collectAccordionKeys = (
    feeds: SubscribeableFeedType[] | undefined,
    parentKey = "",
  ): string[] => {
    if (!feeds) return [];

    const keys: string[] = [];
    feeds.forEach((feed, index) => {
      // For top-level feeds, use the pattern: ${feed.id}-${index}
      // For nested feeds, parentKey is already set from the parent
      const feedKey = parentKey || `${feed.id}-${index}`;
      const hasFeeds = feed.feeds && feed.feeds.length > 0;
      const hasChilds = feed.childs && feed.childs.length > 0;

      if (hasFeeds || hasChilds) {
        // Only add the key if this is a child (has parentKey) or top-level
        if (parentKey) {
          // This is a child feed, key pattern: ${parentKey}-child-${child.id}
          const childKey = `${parentKey}-child-${feed.id}`;
          keys.push(childKey);

          // Recursively collect nested child keys
          if (hasChilds && feed.childs) {
            feed.childs.forEach((nestedChild, nestedIndex) => {
              const nestedParentKey = `${childKey}-${nestedIndex}`;
              keys.push(
                ...collectAccordionKeys([nestedChild], nestedParentKey),
              );
            });
          }
        } else {
          // This is a top-level feed
          keys.push(feedKey);

          if (hasChilds && feed.childs) {
            feed.childs.forEach((child, childIndex) => {
              const childParentKey = `${feedKey}-${childIndex}`;
              keys.push(...collectAccordionKeys([child], childParentKey));
            });
          }
        }
      }
    });
    return keys;
  };

  // Filter feeds based on search query
  const filteredFeeds = useMemo(() => {
    if (!subscribeableFeeds || !searchQuery.trim()) {
      return subscribeableFeeds;
    }

    const query = searchQuery.trim();
    return subscribeableFeeds
      .map((feed) => {
        const matchesTitle = searchTerm(query, feed.title);
        const matchingItems = feed.feeds?.filter(
          (item) =>
            searchTerm(query, item.title) ||
            ((item.description && searchTerm(query, item.description)) ??
              (item.subtitle && searchTerm(query, item.subtitle))),
        );

        const filteredChilds = feed.childs
          ?.map((child: SubscribeableFeedType) =>
            filterChildFeeds(child, query),
          )
          .filter(
            (
              child: SubscribeableFeedType | null,
            ): child is SubscribeableFeedType => child !== null,
          );

        if (matchesTitle) {
          return feed;
        }

        if (matchingItems && matchingItems.length > 0) {
          return {
            ...feed,
            feeds: matchingItems,
            childs: filteredChilds,
          };
        }

        if (filteredChilds && filteredChilds.length > 0) {
          return {
            ...feed,
            childs: filteredChilds,
          };
        }

        return null;
      })
      .filter((feed): feed is NonNullable<typeof feed> => feed !== null);
  }, [subscribeableFeeds, searchQuery]);

  // Compute which accordion items should be open based on searchQuery
  const openAccordionValues = useMemo(() => {
    if (!searchQuery.trim() || !filteredFeeds) {
      return undefined; // Let accordion manage its own state when no search
    }
    return collectAccordionKeys(filteredFeeds);
  }, [filteredFeeds, searchQuery]);

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

  const handleCheckboxChange = (
    item: {
      id: string;
      title: string;
      description: string | null;
      need_zip: boolean;
      zip?: string | null;
    },
    checked: boolean,
  ) => {
    setCheckedStates((prev) => ({
      ...prev,
      [item.id]: checked,
    }));

    // If the item needs zip and is being checked, open the input dialog
    if (checked && item.need_zip && !item.zip) {
      setSelectedFeedItem(item);
      setInputDialogOpen(true);
    } else if (!checked || !item.need_zip || item.zip) {
      // If unchecking or doesn't need zip or already has zip, save immediately
      handleSubscriptionChange({
        id: item.id,
        checked,
        needZip: item.need_zip,
        zip: item.zip,
      });
    }
  };

  const handleInputDialogSave = (zip: string) => {
    if (!selectedFeedItem) return;

    wasSavedRef.current = true;
    handleSubscriptionChange({
      id: selectedFeedItem.id,
      checked: checkedStates[selectedFeedItem.id] ?? true,
      needZip: selectedFeedItem.need_zip,
      zip,
    });
  };

  const handleInputDialogClose = (open: boolean) => {
    setInputDialogOpen(open);
    // If dialog is being closed without saving, uncheck the checkbox
    if (!open && selectedFeedItem && !wasSavedRef.current) {
      const wasChecked = checkedStates[selectedFeedItem.id] ?? false;
      if (wasChecked) {
        setCheckedStates((prev) => ({
          ...prev,
          [selectedFeedItem.id]: false,
        }));
      }
    }
    // Reset the ref for next time
    if (!open) {
      wasSavedRef.current = false;
    }
  };

  // Component to render feed items
  const renderFeedItems = (
    items: SubscribeableFeedItemType[] | undefined,
    parentKey: string,
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-3">
        {items.map((item: SubscribeableFeedItemType, itemIndex: number) => (
          <div
            key={`${parentKey}-item-${itemIndex}-${item.id}`}
            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <Avatar className="h-10 w-10 shrink-0">
              {item.image && <AvatarImage src={item.image} alt={item.title} />}
              <AvatarFallback>
                {item.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.title}</span>
                {item.need_zip && item.zip && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {item.zip}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                className="h-5 w-5"
                checked={checkedStates[item.id] ?? item.checked}
                onCheckedChange={(checked: boolean) => {
                  handleCheckboxChange(item, checked);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Component to render child feeds recursively
  const renderChildFeeds = (
    child: SubscribeableFeedType,
    parentKey: string,
    level = 0,
  ) => {
    const childKey = `${parentKey}-child-${child.id}`;
    const hasFeeds = child.feeds && child.feeds.length > 0;
    const hasChilds = child.childs && child.childs.length > 0;

    if (!hasFeeds && !hasChilds) return null;

    // Filter open values for nested accordions based on parent key prefix
    const nestedOpenValues = openAccordionValues
      ? openAccordionValues.filter((key) => key.startsWith(`${childKey}-`))
      : undefined;

    return (
      <AccordionItem
        key={childKey}
        value={childKey}
        className={level > 0 ? "ml-4 border-l-2 pl-4" : ""}
      >
        <AccordionTrigger>
          <div className="mr-2 flex w-full items-center justify-between">
            <p className={`font-medium ${level > 0 ? "text-sm" : ""}`}>
              {child.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {countCheckedFeeds(child)} / {countAllFeeds(child)} subscribed
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {hasFeeds && renderFeedItems(child.feeds, childKey)}
            {hasChilds && (
              <Accordion
                type="multiple"
                className="w-full"
                value={nestedOpenValues}
              >
                {child.childs?.map(
                  (nestedChild: SubscribeableFeedType, nestedIndex: number) =>
                    renderChildFeeds(
                      nestedChild,
                      `${childKey}-${nestedIndex}`,
                      level + 1,
                    ),
                )}
              </Accordion>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-auto max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search feeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>

            {/* Feeds List */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredFeeds && filteredFeeds.length > 0 ? (
              <Accordion
                type="multiple"
                className="w-full"
                value={openAccordionValues}
              >
                {filteredFeeds.map((feed, index) => {
                  const feedKey = `${feed.id}-${index}`;
                  const hasFeeds = feed.feeds && feed.feeds.length > 0;
                  const hasChilds = feed.childs && feed.childs.length > 0;

                  if (!hasFeeds && !hasChilds) return null;

                  // Filter open values for nested accordions based on feed key prefix
                  const nestedOpenValues = openAccordionValues
                    ? openAccordionValues.filter((key) =>
                        key.startsWith(`${feedKey}-`),
                      )
                    : undefined;

                  return (
                    <AccordionItem key={feedKey} value={feedKey}>
                      <AccordionTrigger>
                        <div className="mr-2 flex w-full items-center justify-between">
                          <p className="font-medium">{feed.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {countCheckedFeeds(feed)} / {countAllFeeds(feed)}{" "}
                            subscribed
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {hasFeeds && renderFeedItems(feed.feeds, feedKey)}
                          {hasChilds && (
                            <Accordion
                              type="multiple"
                              className="w-full"
                              value={nestedOpenValues}
                            >
                              {feed.childs?.map((child, childIndex) =>
                                renderChildFeeds(
                                  child,
                                  `${feedKey}-${childIndex}`,
                                  0,
                                ),
                              )}
                            </Accordion>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {searchQuery
                  ? "No feeds found matching your search."
                  : "No feeds available."}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Input Dialog for feeds that need additional information */}
      <FeedInputDialog
        open={inputDialogOpen}
        onOpenChange={handleInputDialogClose}
        feedItem={selectedFeedItem}
        onSave={handleInputDialogSave}
      />
    </>
  );
}

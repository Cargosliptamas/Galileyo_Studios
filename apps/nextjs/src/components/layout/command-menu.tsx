"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRightIcon,
  LayoutDashboard,
  Loader2,
  Newspaper,
  SearchIcon,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";

import type {
  CommandMenuGroupedResultsType,
  CommandMenuPersonType,
  CommandMenuPostType,
  CommandMenuVideoType,
} from "@galileyo/validators";
import { Badge, Button, cn, toast } from "@galileyo/ui";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "@galileyo/ui/command";

import type { SurfaceItem } from "./command-search-surfaces";
import type { User } from "~/auth/client";
import { useDebounce } from "~/hooks/use-debounce";
import { getInfluencerImageUrl, getUserImageUrl } from "~/lib/image";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { filterSurfaceItems } from "./command-search-surfaces";

type SearchCategory =
  | "all"
  | "people"
  | "posts"
  | "videos"
  | "pages"
  | "features";

const CATEGORY_CHIPS: { key: SearchCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "people", label: "People" },
  { key: "posts", label: "Posts" },
  { key: "videos", label: "Videos" },
  { key: "pages", label: "Pages" },
  { key: "features", label: "Features" },
];

const EMPTY_RESULTS: CommandMenuGroupedResultsType = {
  people: { items: [], total: 0 },
  posts: { items: [], total: 0 },
  videos: { items: [], total: 0 },
};

const previewDate = (value: string | null | undefined) => {
  if (!value) return "Recent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

const categoryMatches = (
  selected: SearchCategory,
  expected: Exclude<SearchCategory, "all">,
) => selected === "all" || selected === expected;

const countLabel = (value: number) => (value > 99 ? "99+" : String(value));

function SectionHeading({
  icon: Icon,
  title,
  count,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{title}</span>
      <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
        {countLabel(count)}
      </span>
    </div>
  );
}

interface ResultShellProps {
  icon?: ReactNode;
  body: ReactNode;
}

function ResultShell({ icon, body }: ResultShellProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-card/90 p-3 shadow-sm transition-colors duration-200 group-hover:border-border group-hover:bg-accent/40 data-[selected=true]:border-border data-[selected=true]:bg-accent/45">
      {icon}
      {body}
    </div>
  );
}

interface CommandMenuProps {
  user: User;
  showMap?: boolean;
}

export default function CommandMenu({
  user,
  showMap = false,
}: CommandMenuProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [hasExplicitSelection, setHasExplicitSelection] = useState(false);
  const hasShownSearchError = useRef(false);

  const debouncedQuery = useDebounce(query, 280);
  const normalizedQuery = debouncedQuery.trim();
  const liveQuery = query.trim();
  const canRunRemoteSearch = open && normalizedQuery.length >= 2;
  const canViewAllResults = liveQuery.length >= 2;
  const viewAllResultsHref = `/search/${encodeURIComponent(liveQuery)}`;

  const surfaceResults = useMemo(() => {
    const filtered = filterSurfaceItems(liveQuery, user, showMap);
    if (liveQuery.length < 2) {
      return {
        pages: filtered.pages.slice(0, 7),
        features: filtered.features.slice(0, 4),
      };
    }

    return {
      pages: filtered.pages,
      features: filtered.features,
    };
  }, [liveQuery, showMap, user]);

  const commandMenuQuery = useQuery({
    ...trpc.search.commandMenu.queryOptions({
      query: normalizedQuery,
      limitPerGroup: 8,
    }),
    enabled: canRunRemoteSearch,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (commandMenuQuery.isError && !hasShownSearchError.current) {
      toast.error(
        "Search is temporarily unavailable. Showing quick shortcuts.",
      );
      hasShownSearchError.current = true;
    }
    if (!commandMenuQuery.isError) {
      hasShownSearchError.current = false;
    }
  }, [commandMenuQuery.isError]);

  const groupedResults = commandMenuQuery.data ?? EMPTY_RESULTS;

  const peopleResults = canRunRemoteSearch ? groupedResults.people.items : [];
  const postResults = canRunRemoteSearch ? groupedResults.posts.items : [];
  const videoResults = canRunRemoteSearch ? groupedResults.videos.items : [];

  const categoryCounts = useMemo(
    () => ({
      people: canRunRemoteSearch ? groupedResults.people.total : 0,
      posts: canRunRemoteSearch ? groupedResults.posts.total : 0,
      videos: canRunRemoteSearch ? groupedResults.videos.total : 0,
      pages: surfaceResults.pages.length,
      features: surfaceResults.features.length,
    }),
    [
      canRunRemoteSearch,
      groupedResults.people.total,
      groupedResults.posts.total,
      groupedResults.videos.total,
      surfaceResults.features.length,
      surfaceResults.pages.length,
    ],
  );

  const hasVisibleResults = useMemo(
    () =>
      canViewAllResults ||
      (categoryMatches(category, "people") && peopleResults.length > 0) ||
      (categoryMatches(category, "posts") && postResults.length > 0) ||
      (categoryMatches(category, "videos") && videoResults.length > 0) ||
      (categoryMatches(category, "pages") && surfaceResults.pages.length > 0) ||
      (categoryMatches(category, "features") &&
        surfaceResults.features.length > 0),
    [
      canViewAllResults,
      category,
      peopleResults.length,
      postResults.length,
      surfaceResults.features.length,
      surfaceResults.pages.length,
      videoResults.length,
    ],
  );

  const closeAndReset = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCategory("all");
    setHasExplicitSelection(false);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
      closeAndReset();
    },
    [closeAndReset, router],
  );

  const handlePersonSelect = useCallback(
    (person: CommandMenuPersonType) => {
      navigateTo(person.route);
    },
    [navigateTo],
  );

  const handlePostSelect = useCallback(
    (post: CommandMenuPostType) => {
      navigateTo(post.route);
    },
    [navigateTo],
  );

  const handleVideoSelect = useCallback(
    (result: CommandMenuVideoType) => {
      navigateTo(result.route);
    },
    [navigateTo],
  );

  const handleSurfaceSelect = useCallback(
    (item: SurfaceItem) => {
      navigateTo(item.href);
    },
    [navigateTo],
  );

  useEffect(() => {
    setHasExplicitSelection(false);
  }, [query, category, open]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        className="group inline-flex h-10 w-full items-center gap-3 rounded-2xl border border-input bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,hsl(var(--background))_72%)] px-3 text-sm text-foreground shadow-sm transition-all duration-200 hover:border-ring/40 hover:bg-accent/40"
        onClick={() => setOpen(true)}
      >
        <SearchIcon
          className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
        <span className="line-clamp-1 flex-1 text-left font-medium text-foreground/90">
          Search people, posts, videos, and shortcuts
        </span>
        <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:inline-flex">
          ⌘K
        </kbd>
      </button>
      {/* <Button
        className="md:hidden"
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
      >
        <SearchIcon size={16} />
        <span className="sr-only">Search</span>
      </Button> */}
      <CommandDialog
        open={open}
        shouldFilter={false}
        contentClassName="w-[calc(100vw-1.25rem)] max-w-4xl border-0 bg-transparent p-0 shadow-none [&>button]:hidden"
        commandClassName="overflow-hidden rounded-3xl border border-border bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,hsl(var(--background))_65%)] text-foreground shadow-xl"
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setQuery("");
            setCategory("all");
            setHasExplicitSelection(false);
          }
        }}
      >
        <div className="border-b border-border bg-background/80 px-4 pb-3 pt-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Social Search
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              Live
            </Badge>
          </div>
          <CommandInput
            placeholder="Try john, wildfire, dashboard, or reel caption..."
            value={query}
            className="h-11 text-[15px]"
            onValueChange={setQuery}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                setHasExplicitSelection(true);
                return;
              }

              if (
                event.key === "Enter" &&
                canViewAllResults &&
                !hasExplicitSelection
              ) {
                event.preventDefault();
                navigateTo(viewAllResultsHref);
              }
            }}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CATEGORY_CHIPS.map((chip) => {
              const chipCount =
                chip.key === "people"
                  ? categoryCounts.people
                  : chip.key === "posts"
                    ? categoryCounts.posts
                    : chip.key === "videos"
                      ? categoryCounts.videos
                      : chip.key === "pages"
                        ? categoryCounts.pages
                        : chip.key === "features"
                          ? categoryCounts.features
                          : categoryCounts.people +
                            categoryCounts.posts +
                            categoryCounts.videos +
                            categoryCounts.pages +
                            categoryCounts.features;
              return (
                <Button
                  key={chip.key}
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setCategory(chip.key)}
                  className={cn(
                    "h-7 gap-1.5 rounded-full border px-2.5 text-xs font-medium",
                    chip.key === category
                      ? "border-border bg-accent text-accent-foreground hover:bg-accent"
                      : "border-border/80 bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span>{chip.label}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {countLabel(chipCount)}
                  </span>
                </Button>
              );
            })}
          </div>
          {liveQuery.length < 2 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Start typing to search people, social posts, and videos. You can
              still jump to key pages and features below.
            </p>
          )}
        </div>

        <CommandList className="max-h-[62vh] overflow-y-auto px-3 pb-4 pt-2">
          {commandMenuQuery.isFetching && canRunRemoteSearch ? (
            <CommandGroup>
              <CommandLoading className="my-2 rounded-2xl border border-border bg-card p-5">
                <Loader2 size={16} className="mr-2 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Searching people, posts, and videos...
                </span>
              </CommandLoading>
            </CommandGroup>
          ) : null}

          {canViewAllResults && (
            <CommandGroup
              heading=""
              className="[&_[cmdk-group-heading]]:hidden"
            >
              <CommandItem
                value={`view-all-${liveQuery}`}
                onSelect={() => navigateTo(viewAllResultsHref)}
                className="group p-0"
              >
                <ResultShell
                  icon={
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-primary/10 text-primary">
                      <SearchIcon className="h-4 w-4" />
                    </div>
                  }
                  body={
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-semibold text-foreground">
                        View all results for "{liveQuery}"
                      </div>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        Open full search page with tabs for People, Posts,
                        Videos, Pages, and Features
                      </p>
                    </div>
                  }
                />
              </CommandItem>
            </CommandGroup>
          )}

          {categoryMatches(category, "people") && peopleResults.length > 0 && (
            <CommandGroup
              heading=""
              className="[&_[cmdk-group-heading]]:hidden"
            >
              <SectionHeading
                icon={UserRound}
                title="People"
                count={peopleResults.length}
              />
              <div className="mt-2 space-y-1">
                {peopleResults.map((person) => (
                  <CommandItem
                    key={`person-${person.type}-${person.id}`}
                    value={`person-${person.id}-${person.name}`}
                    onSelect={() => handlePersonSelect(person)}
                    className="group p-0"
                  >
                    <ResultShell
                      icon={
                        <div className="shrink-0">
                          <UserAvatar
                            name={person.name}
                            image={
                              person.type === "influencer_page"
                                ? getInfluencerImageUrl(person.image)
                                : getUserImageUrl(person.image)
                            }
                            isVerified={false}
                            isInfluencer={person.type === "influencer_page"}
                            onlyAvatar={true}
                            size="small"
                          />
                        </div>
                      }
                      body={
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {person.name}
                            </span>
                            <Badge
                              variant={
                                person.type === "influencer_page"
                                  ? "default"
                                  : "secondary"
                              }
                              className="h-5 rounded-full px-2 text-[10px] uppercase tracking-[0.12em]"
                            >
                              {person.type === "influencer_page"
                                ? "Creator"
                                : "User"}
                            </Badge>
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {person.address ?? person.phone ?? "Open profile"}
                          </p>
                        </div>
                      }
                    />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          )}

          {categoryMatches(category, "posts") && postResults.length > 0 && (
            <>
              <CommandSeparator className="my-2 bg-border" />
              <CommandGroup
                heading=""
                className="[&_[cmdk-group-heading]]:hidden"
              >
                <SectionHeading
                  icon={Newspaper}
                  title="Posts"
                  count={postResults.length}
                />
                <div className="mt-2 space-y-1">
                  {postResults.map((post) => (
                    <CommandItem
                      key={`post-${post.id}`}
                      value={`post-${post.id}-${post.title}`}
                      onSelect={() => handlePostSelect(post)}
                      className="group p-0"
                    >
                      <ResultShell
                        icon={
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-muted text-foreground shadow-sm">
                            <Newspaper className="h-4 w-4" />
                          </div>
                        }
                        body={
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-1 text-sm font-semibold text-foreground">
                              {post.title}
                            </div>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {post.bodyPreview || "Open post details"}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{previewDate(post.createdAt)}</span>
                              <span>•</span>
                              <span>Post</span>
                            </div>
                          </div>
                        }
                      />
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            </>
          )}

          {categoryMatches(category, "videos") && videoResults.length > 0 && (
            <>
              <CommandSeparator className="my-2 bg-border" />
              <CommandGroup
                heading=""
                className="[&_[cmdk-group-heading]]:hidden"
              >
                <SectionHeading
                  icon={Video}
                  title="Videos"
                  count={videoResults.length}
                />
                <div className="mt-2 space-y-1">
                  {videoResults.map((item) => (
                    <CommandItem
                      key={`video-${item.id}`}
                      value={`video-${item.id}-${item.caption ?? ""}`}
                      onSelect={() => handleVideoSelect(item)}
                      className="group p-0"
                    >
                      <ResultShell
                        icon={
                          item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.caption ?? "Video thumbnail"}
                              className="h-12 w-16 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="grid h-12 w-16 shrink-0 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
                              <Video className="h-4 w-4" />
                            </div>
                          )
                        }
                        body={
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-1 text-sm font-semibold text-foreground">
                              {item.caption ?? "Untitled video"}
                            </div>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              by {item.creatorName}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{previewDate(item.createdAt)}</span>
                              <span>•</span>
                              <span>Video</span>
                            </div>
                          </div>
                        }
                      />
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            </>
          )}

          {categoryMatches(category, "pages") &&
            surfaceResults.pages.length > 0 && (
              <>
                <CommandSeparator className="my-2 bg-border" />
                <CommandGroup
                  heading=""
                  className="[&_[cmdk-group-heading]]:hidden"
                >
                  <SectionHeading
                    icon={LayoutDashboard}
                    title="Pages"
                    count={surfaceResults.pages.length}
                  />
                  <div className="mt-2 space-y-1">
                    {surfaceResults.pages.map((surface) => {
                      const Icon = surface.icon;
                      return (
                        <CommandItem
                          key={surface.key}
                          value={`page-${surface.key}-${surface.label}`}
                          onSelect={() => handleSurfaceSelect(surface)}
                          className="group p-0"
                        >
                          <ResultShell
                            icon={
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
                                <Icon className="h-4 w-4" />
                              </div>
                            }
                            body={
                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-1 text-sm font-semibold text-foreground">
                                  {surface.label}
                                </div>
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {surface.description}
                                </p>
                              </div>
                            }
                          />
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
              </>
            )}

          {categoryMatches(category, "features") &&
            surfaceResults.features.length > 0 && (
              <>
                <CommandSeparator className="my-2 bg-border" />
                <CommandGroup
                  heading=""
                  className="[&_[cmdk-group-heading]]:hidden"
                >
                  <SectionHeading
                    icon={Sparkles}
                    title="Features"
                    count={surfaceResults.features.length}
                  />
                  <div className="mt-2 space-y-1">
                    {surfaceResults.features.map((surface) => {
                      const Icon = surface.icon;
                      return (
                        <CommandItem
                          key={surface.key}
                          value={`feature-${surface.key}-${surface.label}`}
                          onSelect={() => handleSurfaceSelect(surface)}
                          className="group p-0"
                        >
                          <ResultShell
                            icon={
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                                <Icon className="h-4 w-4" />
                              </div>
                            }
                            body={
                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-1 text-sm font-semibold text-foreground">
                                  {surface.label}
                                </div>
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {surface.description}
                                </p>
                              </div>
                            }
                          />
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
              </>
            )}

          {!commandMenuQuery.isFetching && !hasVisibleResults && (
            <CommandGroup
              heading=""
              className="[&_[cmdk-group-heading]]:hidden"
            >
              <div className="mx-1 my-3 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No matches for "{query}"
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try people names, post headlines, or a feature like analytics.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  <span>Use category chips to narrow your search</span>
                </div>
              </div>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@galileyo/ui";

import type { SurfaceItem } from "../layout/command-search-surfaces";
import type { User } from "~/auth/client";
import { useDebounce } from "~/hooks/use-debounce";
import { getInfluencerImageUrl, getUserImageUrl } from "~/lib/image";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { filterSurfaceItems } from "../layout/command-search-surfaces";

type SearchTab = "all" | "people" | "posts" | "videos" | "pages" | "features";

const TAB_OPTIONS: { key: SearchTab; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All", icon: SearchIcon },
  { key: "people", label: "People", icon: UserRound },
  { key: "posts", label: "Posts", icon: Newspaper },
  { key: "videos", label: "Videos", icon: Video },
  { key: "pages", label: "Pages", icon: LayoutDashboard },
  { key: "features", label: "Features", icon: Sparkles },
];

const EMPTY_RESULTS: CommandMenuGroupedResultsType = {
  people: { items: [], total: 0 },
  posts: { items: [], total: 0 },
  videos: { items: [], total: 0 },
};

const SERVER_PAGE_LIMIT = 12;

const previewDate = (value: string | null | undefined) => {
  if (!value) return "Recent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

const isSearchTab = (value: string | null): value is SearchTab => {
  return (
    value === "all" ||
    value === "people" ||
    value === "posts" ||
    value === "videos" ||
    value === "pages" ||
    value === "features"
  );
};

const buildResultsHref = (query: string, type: SearchTab) => {
  const base = `/search/${encodeURIComponent(query)}`;
  return type === "all" ? base : `${base}?type=${type}`;
};

const countLabel = (value: number) => (value > 99 ? "99+" : String(value));

function SectionHeading({
  title,
  count,
  icon: Icon,
}: {
  title: string;
  count: number;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span>{title}</span>
      <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
        {countLabel(count)}
      </span>
    </div>
  );
}

function ResultButton({
  icon,
  title,
  description,
  meta,
  badge,
  onSelect,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  meta?: string;
  badge?: React.ReactNode;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn("w-full text-left", className)}
    >
      <Card className="border-border/80 transition-colors hover:border-ring/40 hover:bg-accent/20">
        <CardContent className="flex items-center gap-3 p-3">
          {icon}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">
                {title}
              </p>
              {badge}
            </div>
            {description ? (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
            {meta ? (
              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                {meta}
              </p>
            ) : null}
          </div>
          <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </button>
  );
}

export function SearchResultsPage({
  query,
  user,
  showMap = false,
}: {
  query: string;
  user: User;
  showMap?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trpc = useTRPC();

  const [queryDraft, setQueryDraft] = useState(query);

  useEffect(() => {
    setQueryDraft(query);
  }, [query]);

  const activeQuery = query.trim();
  const debouncedQuery = useDebounce(activeQuery, 220);
  const canRunBackendSearch = debouncedQuery.length >= 2;

  const tabParam = searchParams.get("type");
  const activeTab = isSearchTab(tabParam) ? tabParam : "all";

  const groupedQuery = useQuery({
    ...trpc.search.commandMenu.queryOptions({
      query: debouncedQuery,
      limitPerGroup: 6,
    }),
    enabled: canRunBackendSearch,
    staleTime: 30_000,
  });

  const peopleQuery = useInfiniteQuery({
    ...trpc.search.commandMenuResults.infiniteQueryOptions({
      query: debouncedQuery,
      category: "people",
      limit: SERVER_PAGE_LIMIT,
    }),
    enabled: canRunBackendSearch && activeTab === "people",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: 0,
  });

  const postsQuery = useInfiniteQuery({
    ...trpc.search.commandMenuResults.infiniteQueryOptions({
      query: debouncedQuery,
      category: "posts",
      limit: SERVER_PAGE_LIMIT,
    }),
    enabled: canRunBackendSearch && activeTab === "posts",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: 0,
  });

  const videosQuery = useInfiniteQuery({
    ...trpc.search.commandMenuResults.infiniteQueryOptions({
      query: debouncedQuery,
      category: "videos",
      limit: SERVER_PAGE_LIMIT,
    }),
    enabled: canRunBackendSearch && activeTab === "videos",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: 0,
  });

  const groupedResults = groupedQuery.data ?? EMPTY_RESULTS;
  const peopleItems = useMemo(
    () =>
      peopleQuery.data?.pages.flatMap(
        (page) => page.items as CommandMenuPersonType[],
      ) ?? [],
    [peopleQuery.data?.pages],
  );
  const postItems = useMemo(
    () =>
      postsQuery.data?.pages.flatMap(
        (page) => page.items as CommandMenuPostType[],
      ) ?? [],
    [postsQuery.data?.pages],
  );
  const videoItems = useMemo(
    () =>
      videosQuery.data?.pages.flatMap(
        (page) => page.items as CommandMenuVideoType[],
      ) ?? [],
    [videosQuery.data?.pages],
  );

  const surfaceResults = useMemo(
    () => filterSurfaceItems(activeQuery, user, showMap),
    [activeQuery, showMap, user],
  );

  const allTabSurfaces = useMemo(
    () => ({
      pages: surfaceResults.pages.slice(0, 6),
      features: surfaceResults.features.slice(0, 6),
    }),
    [surfaceResults.features, surfaceResults.pages],
  );

  const handleTabChange = (value: string) => {
    if (!isSearchTab(value) || value === activeTab) return;
    router.replace(buildResultsHref(activeQuery, value));
  };

  const handleRefineSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = queryDraft.trim();

    if (nextQuery.length < 2) {
      toast.error("Use at least 2 characters to search");
      return;
    }

    router.push(buildResultsHref(nextQuery, activeTab));
  };

  const navigateTo = (href: string) => {
    router.push(href);
  };

  const tabCounts = {
    people: canRunBackendSearch ? groupedResults.people.total : 0,
    posts: canRunBackendSearch ? groupedResults.posts.total : 0,
    videos: canRunBackendSearch ? groupedResults.videos.total : 0,
    pages: surfaceResults.pages.length,
    features: surfaceResults.features.length,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <Card className="mb-5 border-border/90 bg-card/95">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Search results</CardTitle>
              <CardDescription>
                Browse people, posts, videos, pages, and app features.
              </CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
              Social Search
            </Badge>
          </div>
          <form
            onSubmit={handleRefineSearch}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={queryDraft}
              onChange={(event) => setQueryDraft(event.target.value)}
              placeholder="Search people, post topics, video captions, and app shortcuts"
              className="h-10"
            />
            <Button type="submit" className="sm:min-w-28">
              Search
            </Button>
          </form>
          <div className="text-sm text-muted-foreground">
            Showing results for{" "}
            <span className="font-semibold text-foreground">
              "{activeQuery}"
            </span>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/60 p-1">
          {TAB_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.key === "people"
                ? tabCounts.people
                : tab.key === "posts"
                  ? tabCounts.posts
                  : tab.key === "videos"
                    ? tabCounts.videos
                    : tab.key === "pages"
                      ? tabCounts.pages
                      : tab.key === "features"
                        ? tabCounts.features
                        : tabCounts.people +
                          tabCounts.posts +
                          tabCounts.videos +
                          tabCounts.pages +
                          tabCounts.features;

            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="gap-1.5 rounded-xl data-[state=active]:bg-background"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {countLabel(count)}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-5">
          {!canRunBackendSearch ? (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-foreground">
                  Enter at least 2 characters to search people, posts, and
                  videos.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You can still use pages and feature shortcuts below.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {groupedQuery.isError ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Live content search is temporarily unavailable. Local pages and
                feature shortcuts are still available.
              </CardContent>
            </Card>
          ) : null}

          {canRunBackendSearch ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="space-y-2">
                <SectionHeading
                  icon={UserRound}
                  title="People"
                  count={groupedResults.people.items.length}
                />
                {groupedResults.people.items.map((person) => (
                  <ResultButton
                    key={`all-person-${person.type}-${person.id}`}
                    onSelect={() => navigateTo(person.route)}
                    icon={
                      <UserAvatar
                        name={person.name}
                        image={
                          person.type === "influencer_page"
                            ? getInfluencerImageUrl(person.image)
                            : getUserImageUrl(person.image)
                        }
                        isInfluencer={person.type === "influencer_page"}
                        isVerified={false}
                        onlyAvatar={true}
                        size="small"
                      />
                    }
                    title={person.name}
                    description={
                      person.address ?? person.phone ?? "Open profile"
                    }
                    badge={
                      <Badge
                        variant={
                          person.type === "influencer_page"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {person.type === "influencer_page" ? "Creator" : "User"}
                      </Badge>
                    }
                  />
                ))}
              </div>

              <div className="space-y-2">
                <SectionHeading
                  icon={Newspaper}
                  title="Posts"
                  count={groupedResults.posts.items.length}
                />
                {groupedResults.posts.items.map((post) => (
                  <ResultButton
                    key={`all-post-${post.id}`}
                    onSelect={() => navigateTo(post.route)}
                    icon={
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/50">
                        <Newspaper className="h-4 w-4 text-muted-foreground" />
                      </div>
                    }
                    title={post.title}
                    description={post.bodyPreview || "Open post details"}
                    meta={`${previewDate(post.createdAt)} • Post`}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <SectionHeading
                  icon={Video}
                  title="Videos"
                  count={groupedResults.videos.items.length}
                />
                {groupedResults.videos.items.map((videoItem) => (
                  <ResultButton
                    key={`all-video-${videoItem.id}`}
                    onSelect={() => navigateTo(videoItem.route)}
                    icon={
                      videoItem.thumbnailUrl ? (
                        <img
                          src={videoItem.thumbnailUrl}
                          alt={videoItem.caption ?? "Video thumbnail"}
                          className="h-10 w-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="grid h-10 w-14 shrink-0 place-items-center rounded-lg border border-border bg-muted/50">
                          <Video className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )
                    }
                    title={videoItem.caption ?? "Untitled video"}
                    description={`by ${videoItem.creatorName}`}
                    meta={`${previewDate(videoItem.createdAt)} • Video`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <SectionHeading
                icon={LayoutDashboard}
                title="Pages"
                count={allTabSurfaces.pages.length}
              />
              {allTabSurfaces.pages.map((surface) => {
                const Icon = surface.icon;
                return (
                  <ResultButton
                    key={surface.key}
                    onSelect={() => navigateTo(surface.href)}
                    icon={
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    }
                    title={surface.label}
                    description={surface.description}
                  />
                );
              })}
            </div>

            <div className="space-y-2">
              <SectionHeading
                icon={Sparkles}
                title="Features"
                count={allTabSurfaces.features.length}
              />
              {allTabSurfaces.features.map((surface) => {
                const Icon = surface.icon;
                return (
                  <ResultButton
                    key={surface.key}
                    onSelect={() => navigateTo(surface.href)}
                    icon={
                      <div className="bg-primary/12 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                    }
                    title={surface.label}
                    description={surface.description}
                  />
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="people" className="space-y-3">
          {peopleQuery.isLoading ? (
            <Card>
              <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading people...
              </CardContent>
            </Card>
          ) : null}

          {peopleItems.map((person) => (
            <ResultButton
              key={`people-${person.type}-${person.id}`}
              onSelect={() => navigateTo(person.route)}
              icon={
                <UserAvatar
                  name={person.name}
                  image={
                    person.type === "influencer_page"
                      ? getInfluencerImageUrl(person.image)
                      : getUserImageUrl(person.image)
                  }
                  isInfluencer={person.type === "influencer_page"}
                  isVerified={false}
                  onlyAvatar={true}
                  size="small"
                />
              }
              title={person.name}
              description={person.address ?? person.phone ?? "Open profile"}
              badge={
                <Badge
                  variant={
                    person.type === "influencer_page" ? "default" : "secondary"
                  }
                >
                  {person.type === "influencer_page" ? "Creator" : "User"}
                </Badge>
              }
            />
          ))}

          {peopleQuery.isError ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                People search is temporarily unavailable.
              </CardContent>
            </Card>
          ) : null}

          {!peopleQuery.isLoading &&
          peopleItems.length === 0 &&
          !peopleQuery.isError ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                No people matched your search query.
              </CardContent>
            </Card>
          ) : null}

          {peopleQuery.hasNextPage ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={peopleQuery.isFetchingNextPage}
                onClick={() => void peopleQuery.fetchNextPage()}
              >
                {peopleQuery.isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  </>
                ) : (
                  "Load more people"
                )}
              </Button>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="posts" className="space-y-3">
          {postsQuery.isLoading ? (
            <Card>
              <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading posts...
              </CardContent>
            </Card>
          ) : null}

          {postItems.map((post) => (
            <ResultButton
              key={`posts-${post.id}`}
              onSelect={() => navigateTo(post.route)}
              icon={
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/50">
                  <Newspaper className="h-4 w-4 text-muted-foreground" />
                </div>
              }
              title={post.title}
              description={post.bodyPreview || "Open post details"}
              meta={`${previewDate(post.createdAt)} • Post`}
            />
          ))}

          {postsQuery.isError ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Post search is temporarily unavailable.
              </CardContent>
            </Card>
          ) : null}

          {!postsQuery.isLoading &&
          postItems.length === 0 &&
          !postsQuery.isError ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                No posts matched your search query.
              </CardContent>
            </Card>
          ) : null}

          {postsQuery.hasNextPage ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={postsQuery.isFetchingNextPage}
                onClick={() => void postsQuery.fetchNextPage()}
              >
                {postsQuery.isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  </>
                ) : (
                  "Load more posts"
                )}
              </Button>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="videos" className="space-y-3">
          {videosQuery.isLoading ? (
            <Card>
              <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading videos...
              </CardContent>
            </Card>
          ) : null}

          {videoItems.map((videoItem) => (
            <ResultButton
              key={`videos-${videoItem.id}`}
              onSelect={() => navigateTo(videoItem.route)}
              icon={
                videoItem.thumbnailUrl ? (
                  <img
                    src={videoItem.thumbnailUrl}
                    alt={videoItem.caption ?? "Video thumbnail"}
                    className="h-10 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid h-10 w-14 shrink-0 place-items-center rounded-lg border border-border bg-muted/50">
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </div>
                )
              }
              title={videoItem.caption ?? "Untitled video"}
              description={`by ${videoItem.creatorName}`}
              meta={`${previewDate(videoItem.createdAt)} • Video`}
            />
          ))}

          {videosQuery.isError ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Video search is temporarily unavailable.
              </CardContent>
            </Card>
          ) : null}

          {!videosQuery.isLoading &&
          videoItems.length === 0 &&
          !videosQuery.isError ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                No videos matched your search query.
              </CardContent>
            </Card>
          ) : null}

          {videosQuery.hasNextPage ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={videosQuery.isFetchingNextPage}
                onClick={() => void videosQuery.fetchNextPage()}
              >
                {videosQuery.isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  </>
                ) : (
                  "Load more videos"
                )}
              </Button>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="pages" className="space-y-3">
          {surfaceResults.pages.map((surface: SurfaceItem) => {
            const Icon = surface.icon;
            return (
              <ResultButton
                key={`page-${surface.key}`}
                onSelect={() => navigateTo(surface.href)}
                icon={
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/50">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                }
                title={surface.label}
                description={surface.description}
              />
            );
          })}

          {surfaceResults.pages.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                No pages matched this query.
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="features" className="space-y-3">
          {surfaceResults.features.map((surface: SurfaceItem) => {
            const Icon = surface.icon;
            return (
              <ResultButton
                key={`feature-${surface.key}`}
                onSelect={() => navigateTo(surface.href)}
                icon={
                  <div className="bg-primary/12 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                }
                title={surface.label}
                description={surface.description}
              />
            );
          })}

          {surfaceResults.features.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                No features matched this query.
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

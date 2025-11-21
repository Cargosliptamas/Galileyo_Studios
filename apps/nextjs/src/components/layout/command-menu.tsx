"use client";

import type { ReactNode } from "react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowUpRightIcon,
  Bookmark,
  Loader2,
  SearchIcon,
  Settings,
} from "lucide-react";

import type { SearchResultUserType } from "@galileyo/validators";
import { Button, toast } from "@galileyo/ui";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
} from "@galileyo/ui/command";

import { useDebounce } from "~/hooks/use-debounce";
import { fuzzySearch } from "~/lib/fuzzy-search";
import { getUserImageUrl } from "~/lib/image";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { navigationLinks } from "./navigation-items";

interface CommandMenuItem {
  key: string;
  href?: string;
  label: string;
  icon?: ReactNode;
  commandKey?: string;
  openNewTab?: boolean;
}

interface CommandMenuGroup {
  key: string;
  label: string;
  items: CommandMenuItem[];
}

interface CommandMenuItems {
  groups: CommandMenuGroup[];
}

const defaultCommandMenuItems: CommandMenuItems = {
  groups: [
    {
      key: "account",
      label: "Account",
      items: [
        {
          key: "account-profile-settings",
          href: "/profile",
          label: "Profile Settings",
          icon: <Settings size={16} />,
          // commandKey: "P",
        },
        {
          key: "account-bookmarks",
          href: "/bookmarks",
          label: "Bookmarks",
          icon: <Bookmark size={16} />,
          // commandKey: "B",
        },
      ],
    },
    {
      key: "navigation",
      label: "Navigation",
      items: [
        {
          key: "nv-home",
          href: "/home",
          label: "Home",
          icon: <ArrowUpRightIcon size={16} />,
          openNewTab: true,
        },
        ...navigationLinks
          .filter((link) => link.label !== "Home")
          .map((link, index) => ({
            key: `navigation-${index}-${link.label}`,
            href: link.href,
            label: link.label,
            icon: <ArrowUpRightIcon size={16} />,
            openNewTab: true,
          })),
      ],
    },
  ],
};

export default function CommandMenu() {
  const router = useRouter();
  const trpc = useTRPC();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(() => defaultCommandMenuItems);
  const [searchResults, setSearchResults] = useState<SearchResultUserType[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  const debouncedQuery = useDebounce(query, 500);

  const searchMutation = useMutation(
    trpc.search.search.mutationOptions({
      onError: (err) => {
        toast.error(err.message || "Failed to search");
        setSearchResults([]);
        setIsSearching(false);
      },
      onSuccess: (data) => {
        // The API returns SearchResult with list array
        setSearchResults(data.list);
        setIsSearching(false);
      },
    }),
  );

  const handleSelect = useCallback(
    (item: CommandMenuItem) => {
      if (item.href) {
        if (item.openNewTab) {
          window.open(item.href, "_blank");
        } else {
          router.push(item.href);
        }
      }
    },
    [router],
  );

  const handleUserSelect = useCallback(
    (user: SearchResultUserType) => {
      // Navigate to user profile or handle user selection
      router.push(`/profile/${user.id}`);
      setOpen(false);
      setQuery("");
      setSearchResults([]);
    },
    [router],
  );

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      setIsSearching(true);
      searchMutation.mutate({
        query: debouncedQuery.trim(),
        limit: 30,
        cursor: 0,
      });
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    // Filter the items based on the debounced query
    const filteredItems = defaultCommandMenuItems.groups.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        fuzzySearch(debouncedQuery, item.label),
      ),
    }));

    setItems({
      groups: filteredItems,
    });
  }, [debouncedQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        className="shadow-xs hidden h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <span className="flex grow items-center">
          <SearchIcon
            className="-ms-1 me-3 text-muted-foreground/80"
            size={16}
            aria-hidden="true"
          />
          <span className="font-normal text-muted-foreground/70">Search</span>
        </span>
        <kbd className="-me-1 ms-12 h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
          ⌘K
        </kbd>
      </button>
      <Button
        className="md:hidden"
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
      >
        <SearchIcon size={16} />
        <span className="sr-only">Search</span>
      </Button>
      <CommandDialog
        open={open}
        shouldFilter={false}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setQuery("");
            setSearchResults([]);
          }
        }}
      >
        <CommandInput
          placeholder="Type a command or search for a user..."
          value={query}
          onValueChange={handleInputChange}
        />
        <CommandList>
          <CommandEmpty>No results for "{query}"</CommandEmpty>
          {searchMutation.isPending || isSearching ? (
            <CommandGroup>
              <CommandLoading className="w-full justify-center">
                <div className="flex items-center justify-center">
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                </div>
              </CommandLoading>
            </CommandGroup>
          ) : (
            <>
              {/* Search Results */}
              {searchResults.length > 0 && (
                <>
                  <CommandGroup heading="Users">
                    {searchResults.map((user) => (
                      <CommandItem
                        key={`user-${user.id}`}
                        value={`user-${user.id}`}
                        onSelect={() => handleUserSelect(user)}
                      >
                        <UserAvatar
                          name={user.name}
                          image={getUserImageUrl(user.image)}
                          isVerified={false}
                          isInfluencer={false}
                          onlyAvatar={true}
                          size="small"
                        />
                        <span>{user.name}</span>
                        {user.address && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {user.address}
                          </span>
                        )}
                        {user.phone && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {user.phone}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Default Menu Items */}
              {items.groups.map((group) => (
                <Fragment key={group.key}>
                  <CommandGroup heading={group.label}>
                    {group.items.map((item) => (
                      <CommandItem
                        key={item.key}
                        value={item.key}
                        onSelect={() => handleSelect(item)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.commandKey && (
                          <CommandShortcut className="justify-center">
                            ⌘{item.commandKey}
                          </CommandShortcut>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </Fragment>
              ))}
            </>
          )}

          {/* <CommandGroup heading="Quick start">
            <CommandItem>
              <FolderPlusIcon
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>New folder</span>
              <CommandShortcut className="justify-center">⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <FileInputIcon
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Import document</span>
              <CommandShortcut className="justify-center">⌘I</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CircleFadingPlusIcon
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Add block</span>
              <CommandShortcut className="justify-center">⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem>
              <ArrowUpRightIcon
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to dashboard</span>
            </CommandItem>
            <CommandItem>
              <ArrowUpRightIcon
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to apps</span>
            </CommandItem>
            <CommandItem>
              <ArrowUpRightIcon
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to connections</span>
            </CommandItem>
          </CommandGroup> */}
        </CommandList>
      </CommandDialog>
    </>
  );
}

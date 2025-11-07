"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { Minus, Phone, PhoneMissed, Video, X } from "lucide-react";

import {
  cn,
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@galileyo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@galileyo/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";
import { ScrollArea } from "@galileyo/ui/scroll-area";

import { authClient } from "~/auth/client";
import { formatDuration } from "~/lib/formatter";
import { getUserImageUrl } from "~/lib/image";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { useCall } from "./call-provider";

export interface ChatWindow {
  id: string;
  conversationId?: number;
  userId: number;
  userName: string;
  userPhoto: string;
  isMinimized: boolean;
  position: { x: number; y: number };
  zIndex: number;
  hasUserMoved?: boolean;
}

interface ChatContextType {
  needsRefetch: Record<number, boolean>;
  setNeedsRefetch: (userId: number, needRefetch: boolean) => void;
  windows: ChatWindow[];
  openChat: (
    userId: number,
    userName: string,
    userPhoto: string,
    needRefetch?: boolean,
  ) => Promise<void>;
  closeChat: (id: string) => void;
  minimizeChat: (id: string) => void;
  restoreChat: (id: string) => void;
  bringToFront: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number },
  ) => void;
  resetPositionsHorizontally: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let nextZIndex = 1000;

// Constants for window dimensions and spacing
const WINDOW_WIDTH = 340;
const WINDOW_HEIGHT = 480;
const WINDOW_GAP = 16;
const MARGIN = 20;
const MINIMIZED_AVATAR_SIZE = 48; // size-12 = 48px
const MINIMIZED_RIGHT_OFFSET = 20; // right: 20px
const MINIMIZED_AREA_WIDTH =
  MINIMIZED_RIGHT_OFFSET + MINIMIZED_AVATAR_SIZE + WINDOW_GAP; // Space reserved for minimized windows + gap

/**
 * Checks if two windows overlap
 */
function windowsOverlap(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number },
): boolean {
  const overlapX =
    pos1.x < pos2.x + WINDOW_WIDTH && pos1.x + WINDOW_WIDTH > pos2.x;
  const overlapY =
    pos1.y < pos2.y + WINDOW_HEIGHT && pos1.y + WINDOW_HEIGHT > pos2.y;
  return overlapX && overlapY;
}

/**
 * Finds a non-overlapping position for a new window
 * Tries to place it adjacent to existing windows if possible
 */
function findNonOverlappingPosition(
  existingWindows: ChatWindow[],
  screenWidth: number,
): { x: number; y: number } {
  const openWindows = existingWindows.filter((w) => !w.isMinimized);
  const minimizedCount = existingWindows.filter((w) => w.isMinimized).length;

  // Reserve space for minimized windows on the right side (only if there are minimized windows)
  const reservedSpace = minimizedCount > 0 ? MINIMIZED_AREA_WIDTH : MARGIN;

  // Calculate the maximum right edge position for open windows
  const maxRightEdge = screenWidth - reservedSpace;
  const startY = MARGIN; // bottom offset

  // If there are no existing open windows, place at the rightmost position
  if (openWindows.length === 0) {
    return { x: Math.max(MARGIN, maxRightEdge - WINDOW_WIDTH), y: startY };
  }

  // Sort existing windows by x position (rightmost first)
  const sortedWindows = [...openWindows].sort(
    (a, b) => b.position.x - a.position.x,
  );

  // Try to place the new window to the left of the leftmost window
  const leftmostWindow = sortedWindows[sortedWindows.length - 1];
  if (leftmostWindow) {
    const candidateX = leftmostWindow.position.x - WINDOW_WIDTH - WINDOW_GAP;

    // Check if this position would overlap with anything
    if (candidateX >= MARGIN) {
      const candidatePos = { x: candidateX, y: startY };
      const overlaps = openWindows.some((w) =>
        windowsOverlap(candidatePos, w.position),
      );

      if (!overlaps) {
        return candidatePos;
      }
    }
  }

  // If we can't place it to the left, try positions from right to left
  let x = Math.max(MARGIN, maxRightEdge - WINDOW_WIDTH);
  while (x >= MARGIN) {
    const candidatePos = { x, y: startY };

    // Check if this position overlaps with any existing window
    const overlaps = openWindows.some((w) =>
      windowsOverlap(candidatePos, w.position),
    );

    if (!overlaps) {
      return candidatePos;
    }

    // Move left by window width + gap
    x -= WINDOW_WIDTH + WINDOW_GAP;
  }

  // If we can't find a position on the first row, return the leftmost position
  return { x: MARGIN, y: startY };
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<ChatWindow[]>([]);
  const [needsRefetch, setNeedsRefetch] = useState<Record<number, boolean>>({});
  const trpc = useTRPC();

  const { data: session } = authClient.useSession();

  // Rehydrate open chat windows on mount
  useEffect(() => {
    try {
      const raw = globalThis.window.localStorage.getItem("chat_windows_v1");

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<ChatWindow>[];
      const sanitized: ChatWindow[] = parsed
        .map((w, idx) => {
          const oldY = Number(w.position?.y ?? 20);
          // Convert old top-based positions to bottom-based positions
          // If y is > 100, it's likely an old top-based position, reset to bottom offset
          // Otherwise, clamp to reasonable bottom offset (20px)
          const bottomY = oldY > 100 ? 20 : Math.max(20, oldY);

          return {
            id: String(w.id ?? `restored-${idx}-${Date.now()}`),
            conversationId:
              typeof w.conversationId === "number"
                ? w.conversationId
                : undefined,
            userId: Number(w.userId),
            userName: String(w.userName ?? ""),
            userPhoto: String(w.userPhoto ?? ""),
            isMinimized: Boolean(w.isMinimized),
            position: {
              x: Math.max(0, Number(w.position?.x ?? 20)),
              y: bottomY,
            },
            zIndex: Number(w.zIndex ?? 1000),
            hasUserMoved: Boolean(w.hasUserMoved),
          };
        })
        .filter((w) => Number.isFinite(w.userId) && !!w.userName);

      if (sanitized.length) {
        setWindows(sanitized);
        const maxZ = sanitized.reduce(
          (m, w) => (w.zIndex > m ? w.zIndex : m),
          1000,
        );
        nextZIndex = maxZ + 1;
      }
    } catch (error) {
      // ignore restoration errors
      console.error("error restoring chat windows", error);
    }
  }, []);

  // Persist open chat windows on change
  useEffect(() => {
    try {
      const toStore = windows.map((w) => ({
        id: w.id,
        conversationId: w.conversationId,
        userId: w.userId,
        userName: w.userName,
        userPhoto: w.userPhoto,
        isMinimized: w.isMinimized,
        position: w.position,
        zIndex: w.zIndex,
        hasUserMoved: w.hasUserMoved,
      }));
      globalThis.window.localStorage.setItem(
        "chat_windows_v1",
        JSON.stringify(toStore),
      );
    } catch (error) {
      console.error("error persisting chat windows", error);
    }
  }, [windows]);

  const createConversationMutation = useMutation(
    trpc.chat.getOrCreateConversation.mutationOptions(),
  );

  const closeChat = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeChat = useCallback((id: string) => {
    setWindows((prev) => {
      // First, minimize the targeted window
      const next = prev.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w,
      );

      // Recalculate positions for open windows that haven't been manually moved
      const screenW = globalThis.window.innerWidth;
      const minimizedCount = next.filter((w) => w.isMinimized).length;

      // Reserve space for minimized windows on the right side (only if there are minimized windows)
      const reservedSpace = minimizedCount > 0 ? MINIMIZED_AREA_WIDTH : MARGIN;

      // Calculate the maximum right edge position for open windows
      const maxRightEdge = screenW - reservedSpace;
      const startY = MARGIN;

      // Separate windows into those that need repositioning and those that don't
      const windowsToReposition = next
        .filter((w) => !w.isMinimized && !w.hasUserMoved)
        .sort((a, b) => b.position.x - a.position.x); // Sort rightmost first

      // Find the rightmost edge where we can start positioning
      // This should be the rightmost edge, but we'll pack windows tightly
      let x = Math.max(MARGIN, maxRightEdge - WINDOW_WIDTH);

      // Reposition windows sequentially without gaps
      const repositionedMap = new Map<string, ChatWindow>();
      windowsToReposition.forEach((w) => {
        repositionedMap.set(w.id, { ...w, position: { x, y: startY } });
        x -= WINDOW_WIDTH + WINDOW_GAP;
      });

      // Return all windows with repositioned ones updated
      return next.map((w) => {
        const repositioned = repositionedMap.get(w.id);
        return repositioned ?? w;
      });
    });
  }, []);

  const restoreChat = useCallback((id: string) => {
    setWindows((prev) => {
      const screenW = globalThis.window.innerWidth;
      const windowToRestore = prev.find((w) => w.id === id);

      if (!windowToRestore) return prev;

      // If window was manually moved before, keep its position
      if (windowToRestore.hasUserMoved) {
        return prev.map((w) =>
          w.id === id ? { ...w, isMinimized: false } : w,
        );
      }

      // Otherwise, find a non-overlapping position and then reposition all non-manually-moved windows
      // to pack them tightly together
      const otherWindows = prev.filter((w) => w.id !== id);
      const newPosition = findNonOverlappingPosition(otherWindows, screenW);

      // Update the restored window
      const updated = prev.map((w) =>
        w.id === id ? { ...w, isMinimized: false, position: newPosition } : w,
      );

      // Now reposition all non-manually-moved windows to pack them tightly
      const minimizedCount = updated.filter((w) => w.isMinimized).length;
      const reservedSpace = minimizedCount > 0 ? MINIMIZED_AREA_WIDTH : MARGIN;
      const maxRightEdge = screenW - reservedSpace;
      let x = Math.max(MARGIN, maxRightEdge - WINDOW_WIDTH);
      const startY = MARGIN;

      const windowsToReposition = updated
        .filter((w) => !w.isMinimized && !w.hasUserMoved)
        .sort((a, b) => b.position.x - a.position.x);

      const repositionedMap = new Map<string, ChatWindow>();
      windowsToReposition.forEach((w) => {
        repositionedMap.set(w.id, { ...w, position: { x, y: startY } });
        x -= WINDOW_WIDTH + WINDOW_GAP;
      });

      return updated.map((w) => {
        const repositioned = repositionedMap.get(w.id);
        return repositioned ?? w;
      });
    });
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex++ } : w)),
    );
  }, []);

  const openChat = useCallback(
    async (
      userId: number,
      userName: string,
      userPhoto: string,
      needRefetch = false,
    ) => {
      await Promise.resolve();
      setNeedsRefetch((prev) => ({ ...prev, [userId]: needRefetch }));

      // Check if chat already exists
      const existingWindow = windows.find((w) => w.userId === userId);
      if (existingWindow) {
        bringToFront(existingWindow.id);
        if (existingWindow.isMinimized) {
          restoreChat(existingWindow.id);
        }
        return;
      }

      // Create or get conversation
      createConversationMutation.mutate(
        { userId },
        {
          onSuccess: (conversation) => {
            const screenW = globalThis.window.innerWidth;

            const newWindow: ChatWindow = {
              id: `${userId}-${Date.now()}`,
              conversationId: conversation.id,
              userId,
              userName,
              userPhoto,
              isMinimized: false,
              position: { x: 0, y: 0 }, // Temporary, will be repositioned
              zIndex: nextZIndex++,
            };

            setWindows((prev) => {
              const updated = [...prev, newWindow];

              // Reposition all non-manually-moved windows to pack them tightly
              const minimizedCount = updated.filter(
                (w) => w.isMinimized,
              ).length;
              const reservedSpace =
                minimizedCount > 0 ? MINIMIZED_AREA_WIDTH : MARGIN;
              const maxRightEdge = screenW - reservedSpace;
              let x = Math.max(MARGIN, maxRightEdge - WINDOW_WIDTH);
              const startY = MARGIN;

              const windowsToReposition = updated
                .filter((w) => !w.isMinimized && !w.hasUserMoved)
                .sort((a, b) => b.position.x - a.position.x);

              const repositionedMap = new Map<string, ChatWindow>();
              windowsToReposition.forEach((w) => {
                repositionedMap.set(w.id, { ...w, position: { x, y: startY } });
                x -= WINDOW_WIDTH + WINDOW_GAP;
              });

              return updated.map((w) => {
                const repositioned = repositionedMap.get(w.id);
                return repositioned ?? w;
              });
            });
          },
        },
      );
    },
    [windows, createConversationMutation, bringToFront, restoreChat],
  );

  useSubscription(
    trpc.chat.onMessage.subscriptionOptions(undefined, {
      enabled: session?.user.id !== undefined,
      onData: (msg) => {
        void openChat(
          msg.data.id_user,
          msg.data.user.full_name,
          getUserImageUrl(msg.data.user.photo?.replace("/uploads/user/", "")) ??
            "",
          true,
        );
      },
    }),
  );

  return (
    <ChatContext.Provider
      value={{
        windows,
        needsRefetch,
        setNeedsRefetch: (userId, needRefetch) => {
          setNeedsRefetch((prev) => ({ ...prev, [userId]: needRefetch }));
        },
        openChat,
        closeChat,
        minimizeChat,
        restoreChat,
        bringToFront,
        updateWindowPosition: (id, position) => {
          setWindows((prev) =>
            prev.map((w) =>
              w.id === id ? { ...w, position, hasUserMoved: true } : w,
            ),
          );
        },
        resetPositionsHorizontally: () => {
          setWindows((prev) => {
            const screenW = globalThis.window.innerWidth;
            const minimizedCount = prev.filter((w) => w.isMinimized).length;

            // Reserve space for minimized windows on the right side (only if there are minimized windows)
            const reservedSpace =
              minimizedCount > 0 ? MINIMIZED_AREA_WIDTH : MARGIN;

            // Calculate the maximum right edge position for open windows
            const maxRightEdge = screenW - reservedSpace;
            let x = Math.max(MARGIN, maxRightEdge - WINDOW_WIDTH);
            const startY = MARGIN;

            // Sort open windows by current x position (rightmost first) for consistent repositioning
            const openWindows = prev
              .filter((w) => !w.isMinimized)
              .sort((a, b) => b.position.x - a.position.x);

            const repositionedMap = new Map<string, ChatWindow>();
            openWindows.forEach((w) => {
              repositionedMap.set(w.id, {
                ...w,
                position: { x, y: startY },
                hasUserMoved: false, // Reset manual move flag
              });
              x -= WINDOW_WIDTH + WINDOW_GAP;
            });

            return prev.map((w) => {
              if (w.isMinimized) return w;
              const repositioned = repositionedMap.get(w.id);
              return repositioned ?? w;
            });
          });
        },
      }}
    >
      {children}
      <ChatWindows />
    </ChatContext.Provider>
  );
}

function ChatWindows() {
  const { windows, closeChat, minimizeChat, restoreChat, bringToFront } =
    useChat();

  const minimizedOrder = windows.filter((w) => w.isMinimized);

  return (
    <>
      {windows.map((window) => (
        <ChatWindowComponent
          key={window.id}
          window={window}
          minimizedIndex={
            window.isMinimized
              ? minimizedOrder.findIndex((w) => w.id === window.id)
              : undefined
          }
          onClose={() => closeChat(window.id)}
          onMinimize={() => minimizeChat(window.id)}
          onRestore={() => restoreChat(window.id)}
          onBringToFront={() => bringToFront(window.id)}
        />
      ))}
    </>
  );
}

function ChatWindowComponent({
  window,
  minimizedIndex,
  onClose,
  onMinimize,
  onRestore,
  onBringToFront,
}: {
  window: ChatWindow;
  minimizedIndex?: number;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  onBringToFront: () => void;
}) {
  const [position, setPosition] = useState(window.position);
  const windowRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();
  const { needsRefetch, setNeedsRefetch } = useChat();
  const { startCall } = useCall();

  useEffect(() => {
    setPosition(window.position);
  }, [window.position]);

  const {
    data: messagesData,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...(window.conversationId
      ? trpc.chat.getMessages.infiniteQueryOptions({
          conversationId: window.conversationId,
          limit: 100,
          cursor: 1,
        })
      : {
          queryKey: trpc.chat.getMessages.infiniteQueryKey({
            conversationId: 0,
            limit: 100,
          }),
          queryFn: () =>
            Promise.resolve({
              id: 0,
              list: [],
              count: 0,
              page: 1,
              page_size: 100,
            }),
          enabled: false,
        }),
    getNextPageParam: (lastPage) => {
      // Check if there are more pages by comparing list length with page_size
      // If the last page has fewer items than the page_size, we've reached the end
      if (
        lastPage.list.length === 0 ||
        lastPage.list.length < lastPage.page_size
      ) {
        return null;
      }
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });

  const messages =
    messagesData?.pages
      .slice()
      .reverse()
      .flatMap((page) => [...page.list].reverse()) ?? [];

  useEffect(() => {
    if (needsRefetch[window.userId]) {
      void refetch();
      setNeedsRefetch(window.userId, false);
    }
  }, [needsRefetch[window.userId], refetch, setNeedsRefetch, window.userId]);

  if (window.isMinimized) {
    const step = 56; // avatar(48px) + gap(8px)
    const bottomOffset =
      20 + (typeof minimizedIndex === "number" ? minimizedIndex * step : 0);
    return (
      <div
        ref={windowRef}
        style={{
          position: "fixed",
          bottom: bottomOffset,
          right: 20,
          zIndex: window.zIndex + 10,
          cursor: "pointer",
        }}
        title={window.userName}
        onClick={onRestore}
      >
        <Avatar className="size-12 shadow-lg ring-1 ring-border">
          <AvatarImage src={window.userPhoto} alt={window.userName} />
          <AvatarFallback>{window.userName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      style={{
        position: "fixed",
        left: position.x,
        bottom: position.y,
        zIndex: window.zIndex,
        width: "340px",
        height: "480px",
      }}
      className="flex flex-col rounded-lg border bg-background shadow-lg"
    >
      <div
        className={cn(
          "flex items-center justify-between border-b bg-muted/50 px-4 py-2",
        )}
        onClick={onBringToFront}
      >
        <div className="flex items-center gap-2">
          {/* <Avatar className="size-8">
            <AvatarImage src={window.userPhoto} alt={window.userName} />
            <AvatarFallback>{window.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{window.userName}</span> */}
          <UserAvatar
            size="small"
            name={window.userName}
            image={window.userPhoto}
            isVerified={false}
            isInfluencer={false}
            href={`/profile/${window.userId}`}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation();
              void startCall({
                callType: "voice",
                remoteUserId: window.userId,
                remoteProfile: {
                  name: window.userName,
                  photo: window.userPhoto,
                },
              });
            }}
            title="Call"
          >
            <Phone className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation();
              void startCall({
                callType: "video",
                remoteUserId: window.userId,
                remoteProfile: {
                  name: window.userName,
                  photo: window.userPhoto,
                },
              });
            }}
            title="Video Call"
          >
            <Video className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onMinimize}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <ChatMessages
        conversationId={window.conversationId}
        messages={messages}
        isLoading={isLoading}
        userName={window.userName}
        userPhoto={window.userPhoto}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
      <ChatInput
        conversationId={window.conversationId}
        userId={window.userId}
      />
    </div>
  );
}

function ChatMessageTimestamp({
  timestamp,
  isOwnMessage = false,
  isSystemMessage = false,
}: {
  timestamp: Date;
  isOwnMessage?: boolean;
  isSystemMessage?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            className={cn(
              "mt-1 text-xs text-muted-foreground",
              isOwnMessage && "text-primary-foreground/70",
              isSystemMessage && "mt-0 text-end text-muted-foreground",
            )}
          >
            {new Intl.DateTimeFormat("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              // hour12: true,
            }).format(timestamp)}
          </p>
        </TooltipTrigger>
        <TooltipContent className="z-[10000]">
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(timestamp)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SystemMessageContainer({
  children,
  timestamp,
}: {
  children: React.ReactNode | React.ReactNode[];
  timestamp: Date;
}) {
  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg bg-muted p-2 text-muted-foreground">
        {children}
      </div>
      <ChatMessageTimestamp
        timestamp={new Date(timestamp)}
        isSystemMessage={true}
      />
    </>
  );
}

function SystemMessage({
  message,
  timestamp,
  metadata,
}: {
  message: string;
  timestamp: Date;
  metadata?: {
    isAnswered: boolean;
    time: number;
  } | null;
}) {
  if (message === "call_ended") {
    return (
      <SystemMessageContainer timestamp={timestamp}>
        {metadata?.isAnswered ? (
          <p className="text-sm">
            Call ended. Duration: {formatDuration(metadata.time)}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <PhoneMissed className="size-4 text-red-500" />
            <span className="text-sm">Unanswered call</span>
          </div>
        )}
      </SystemMessageContainer>
    );
  }

  if (message === "added_as_friend") {
    return (
      <SystemMessageContainer timestamp={timestamp}>
        <p className="text-sm">You are now friends</p>
      </SystemMessageContainer>
    );
  }

  return null;
}

export function ChatMessages({
  // conversationId,
  messages,
  isLoading,
  userName,
  userPhoto,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  conversationId?: number;
  messages: {
    id: number;
    id_user: number;
    is_my: boolean;
    is_system: boolean;
    metadata?: {
      isAnswered: boolean;
      time: number;
    } | null;
    message: string;
    files: string[];
    is_viewed: boolean;
    created_at: string;
    received_at: string;
  }[];
  isLoading: boolean;
  userName: string;
  userPhoto?: string | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const prevScrollHeightRef = useRef<number>(0);
  const isLoadingOlderRef = useRef<boolean>(false);
  const savedScrollTopRef = useRef<number>(0);

  // Track when we start loading older messages (backup - scroll handler already saves position)
  useEffect(() => {
    if (
      isFetchingNextPage &&
      scrollAreaRef.current &&
      !isLoadingOlderRef.current
    ) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        // If user is near the top (scrolling up to load older messages)
        if (scrollTop < 200) {
          isLoadingOlderRef.current = true;
          savedScrollTopRef.current = scrollTop;
          prevScrollHeightRef.current = scrollContainer.scrollHeight;
        }
      }
    }
  }, [isFetchingNextPage]);

  // Handle scroll position after messages update
  useEffect(() => {
    if (!scrollAreaRef.current) return;

    const scrollContainer = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (!scrollContainer) return;

    const currentMessagesLength = messages.length;
    const prevMessagesLength = prevMessagesLengthRef.current;
    // const currentScrollHeight = scrollContainer.scrollHeight;
    const prevScrollHeight = prevScrollHeightRef.current;
    // const currentScrollTop = scrollContainer.scrollTop;

    // If we were loading older messages and now messages have increased
    if (
      isLoadingOlderRef.current &&
      currentMessagesLength > prevMessagesLength &&
      prevScrollHeight > 0
    ) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (!scrollAreaRef.current) return;
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (!scrollContainer) return;

        // Calculate the difference in scroll height (new content added at top)
        const newScrollHeight = scrollContainer.scrollHeight;
        const scrollDiff = newScrollHeight - prevScrollHeight;

        // Restore scroll position: add the height difference to maintain visual position
        scrollContainer.scrollTop = savedScrollTopRef.current + scrollDiff;

        // Update the refs after restoring scroll position
        prevScrollHeightRef.current = newScrollHeight;
      });

      // Reset the flag and update message length
      isLoadingOlderRef.current = false;
      prevMessagesLengthRef.current = currentMessagesLength;
      // Don't update prevScrollHeightRef here - it's updated in requestAnimationFrame
      return; // Early return to skip the rest of the effect
    }

    if (currentMessagesLength > prevMessagesLength) {
      // New messages added (either from subscription or initial load)
      // Only auto-scroll to bottom if user is near bottom or it's initial load
      const isNearBottom =
        scrollContainer.scrollHeight -
          scrollContainer.scrollTop -
          scrollContainer.clientHeight <
        100;

      if (prevMessagesLength === 0 || isNearBottom) {
        // Initial load or user was at bottom - scroll to bottom
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
      // Otherwise, preserve scroll position (user is viewing older messages)
    } else if (currentMessagesLength < prevMessagesLength) {
      // Messages were replaced (e.g., refetch) - scroll to bottom
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      isLoadingOlderRef.current = false;
    }

    // Update refs for next comparison
    prevMessagesLengthRef.current = currentMessagesLength;
    prevScrollHeightRef.current = scrollContainer.scrollHeight;
  }, [messages]);

  // Set up scroll listener for infinite loading
  useEffect(() => {
    if (!scrollAreaRef.current || !fetchNextPage || !hasNextPage) return;

    const scrollContainer = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight } = scrollContainer;
      // Load more when user scrolls near the top (within 100px)
      if (scrollTop < 100 && !isFetchingNextPage) {
        // Save scroll position and height before fetching
        isLoadingOlderRef.current = true;
        savedScrollTopRef.current = scrollTop;
        prevScrollHeightRef.current = scrollHeight;
        fetchNextPage();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  // Messages are already in chronological order (oldest to newest)
  // after reversing pages and each page's list
  const sortedMessages = messages;

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1">
      <div className="flex flex-col gap-2 p-4">
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="text-xs text-muted-foreground">
              Loading older messages...
            </div>
          </div>
        )}
        {sortedMessages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          </div>
        ) : (
          sortedMessages.map((message) => {
            const isOwnMessage = message.is_my;
            const isSystemMessage = message.is_system;

            if (isSystemMessage) {
              return (
                <SystemMessage
                  key={message.id}
                  message={message.message}
                  timestamp={new Date(message.created_at)}
                  metadata={message.metadata}
                />
              );
            }

            return (
              <div
                key={message.id}
                className={cn("flex gap-2", isOwnMessage && "flex-row-reverse")}
              >
                {!isOwnMessage && (
                  <Avatar className="size-6">
                    <AvatarImage src={userPhoto ?? ""} alt={userName} />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2",
                    isOwnMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <p className="text-sm">{message.message}</p>

                  <ChatMessageTimestamp
                    timestamp={new Date(message.created_at)}
                    isOwnMessage={isOwnMessage}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}

export function ChatInput({
  conversationId,
  userId,
  isFriendChat = false,
}: {
  conversationId?: number;
  userId: number;
  isFriendChat?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation(
    trpc.chat.sendMessage.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        setMessage("");
        if (conversationId) {
          if (isFriendChat) {
            await queryClient.invalidateQueries({
              queryKey: trpc.chat.getFriendChat.infiniteQueryKey({
                userId: userId,
                limit: 100,
              }),
            });
          } else {
            await queryClient.invalidateQueries({
              queryKey: trpc.chat.getMessages.infiniteQueryKey({
                conversationId,
                limit: 100,
              }),
            });
          }
        }
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(
      {
        message: message.trim(),
        conversationId,
        userId: conversationId ? undefined : userId,
        createdAt: new Date().toISOString(),
      },
      {
        // onSuccess: () => {},
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="relative border-t p-3">
      <div className="relative flex items-center gap-2">
        <Popover open={showEmoji} onOpenChange={setShowEmoji}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <span role="img" aria-label="emoji" className="text-lg">
                😊
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            alignOffset={0}
            className="z-[10000] w-72 p-0"
          >
            <EmojiPicker
              className="h-72 w-72"
              onEmojiSelect={(emoji) => {
                setMessage((prev) => `${prev}${emoji.emoji}`);
              }}
              autoFocus
            >
              <EmojiPickerSearch />
              <EmojiPickerContent className="h-[calc(18rem-4rem)]" />
              <EmojiPickerFooter />
            </EmojiPicker>
          </PopoverContent>
        </Popover>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={sendMessageMutation.isPending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || sendMessageMutation.isPending}
        >
          Send
        </Button>
      </div>
    </form>
  );
}

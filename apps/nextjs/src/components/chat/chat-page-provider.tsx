"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import { useIsMobile } from "@galileyo/ui/hooks";

import { ChatRecipients, ChatRecipientsSkeleton } from "./chat-recipients";

export const ChatPageContext = createContext({
  show: true,
  setShow: (_: boolean) => {
    // noop
  },
});

export function useChatPage() {
  const context = useContext(ChatPageContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error("useChatPage must be used within a ChatPageProvider");
  }

  return context;
}

export function ChatPageProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    setShow(!isMobile);
  }, [isMobile]);

  return (
    <ChatPageContext.Provider value={{ show, setShow }}>
      <div className="flex h-[calc(100vh-theme(spacing.20))] flex-row p-2">
        {show && (
          <div className="h-full w-full px-2 md:w-64 md:border-r">
            <div className="flex flex-row items-center justify-between">
              <span className="text-lg font-semibold">Friends</span>

              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShow(!show)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
              )}
            </div>
            <div>
              <Suspense fallback={<ChatRecipientsSkeleton />}>
                <ChatRecipients />
              </Suspense>
            </div>
          </div>
        )}
        {children}
      </div>
    </ChatPageContext.Provider>
  );
}

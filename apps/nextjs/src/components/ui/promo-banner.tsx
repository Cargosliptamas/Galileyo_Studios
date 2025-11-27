"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GiftIcon, XIcon } from "lucide-react";
import { useTimer } from "react-timer-hook";

import { Button } from "@galileyo/ui/button";

export default function PromoBanner({ endDate }: { endDate: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { days, hours, minutes, seconds } = useTimer({
    expiryTimestamp: new Date(endDate),
    onExpire: () => {
      setIsVisible(false);
    },
  });

  useEffect(() => {
    if (new Date(endDate) > new Date()) {
      setIsVisible(true);
    }
  }, [endDate]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-muted px-4 py-3 text-foreground">
      <div className="flex gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center">
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 max-md:mt-0.5"
          >
            <GiftIcon className="opacity-80" size={16} />
          </div>
          <div className="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Holiday Promotion!</p>
              <p className="text-sm text-muted-foreground">
                Sign up for a membership and get a second account free at the
                same tier.
              </p>
            </div>
            <div className="flex gap-3 max-md:flex-wrap">
              <div className="flex items-center divide-x divide-primary-foreground rounded-md bg-primary/15 text-sm tabular-nums">
                {days > 0 && (
                  <span className="flex h-8 items-center justify-center p-2">
                    {days}
                    <span className="text-muted-foreground">d</span>
                  </span>
                )}
                <span className="flex h-8 items-center justify-center p-2">
                  {hours.toString().padStart(2, "0")}
                  <span className="text-muted-foreground">h</span>
                </span>
                <span className="flex h-8 items-center justify-center p-2">
                  {minutes.toString().padStart(2, "0")}
                  <span className="text-muted-foreground">m</span>
                </span>
                <span className="flex h-8 items-center justify-center p-2">
                  {seconds.toString().padStart(2, "0")}
                  <span className="text-muted-foreground">s</span>
                </span>
              </div>
              <Button
                className="text-sm"
                size="sm"
                onClick={() => router.push("/holiday-promo")}
              >
                <GiftIcon className="mr-2 h-5 w-5" />
                Sign up now
              </Button>
            </div>
          </div>
        </div>
        <Button
          aria-label="Close banner"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => setIsVisible(false)}
          variant="ghost"
        >
          <XIcon
            aria-hidden="true"
            className="opacity-60 transition-opacity group-hover:opacity-100"
            size={16}
          />
        </Button>
      </div>
    </div>
  );
}

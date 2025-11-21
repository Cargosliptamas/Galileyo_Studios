"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { PlanType } from "@galileyo/validators";
import { Button, ScrollArea } from "@galileyo/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

import { usePlanSwitch } from "~/hooks/use-plan-switch";
import { useTRPC } from "~/trpc/react";
import { PlanCard } from "./plan-card";
import { PlanCardSkeleton } from "./plan-card-skeleton";

export function PlansModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { setPlan, showSwitchPlanModal } = usePlanSwitch();
  const trpc = useTRPC();
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Detect screen size and show full features on desktop by default
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show full features
      if (!mobile) {
        setShowFullFeatures(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const { data: plans, isLoading } = useQuery({
    ...trpc.payment.getAvailablePlans.queryOptions({}),
    enabled: open,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleUpgrade = useCallback((plan: PlanType) => {
    setPlan(plan);
    showSwitchPlanModal(true);
  }, []);

  const newPlans = useMemo(() => {
    // return plans?.list.sort((a, b) => a.price - b.price) ?? [];
    return (
      plans?.list
        .filter((plan) => plan.is_new_plan)
        .sort((a, b) => a.price - b.price) ?? []
    );
  }, [plans]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-full flex-col overflow-hidden md:max-h-[85vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Switch plan</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden md:space-y-6">
          <div className="flex flex-shrink-0 items-center justify-between">
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Choose the plan that best fits your needs
            </p>
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullFeatures(!showFullFeatures)}
              >
                {showFullFeatures ? "Hide" : "Full"} Comparison
              </Button>
            )}
          </div>
          <ScrollArea className="h-[calc(90vh-180px)] md:h-[calc(85vh-180px)]">
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {isLoading ? (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <PlanCardSkeleton key={index} />
                  ))}
                </>
              ) : (
                newPlans.map((plan, index) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onUpgrade={handleUpgrade}
                    showFullFeatures={showFullFeatures}
                    previousPlan={index > 0 ? newPlans[index - 1] : null}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

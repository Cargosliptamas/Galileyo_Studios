"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
} from "@galileyo/ui";
import { DialogClose } from "@galileyo/ui/dialog";

import type { User } from "~/auth/client";
import { usePlanSwitch } from "~/hooks/use-plan-switch";
import { useTRPC } from "~/trpc/react";
import { PlanCard } from "./plan-card";

export function Membership({ user }: { user: User }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { setPlan, showPlansModal } = usePlanSwitch();

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: plans } = useSuspenseQuery(
    trpc.payment.getAvailablePlans.queryOptions({}),
  );

  const cancelMembership = useMutation(
    trpc.payment.cancelMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.payment.pathFilter());
        setShowCancelDialog(false);
        toast.success("Membership cancelled");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to cancel membership");
      },
    }),
  );

  const restoreMembership = useMutation(
    trpc.payment.restoreMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.payment.pathFilter());
        toast.success("Membership restored");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to restore membership");
      },
    }),
  );

  const currentPlan = useMemo(() => {
    return plans.list.find((plan) => plan.current);
  }, [plans]);

  const scheduledPlan = useMemo(() => {
    return plans.list.find((plan) => plan.is_scheduled);
  }, [plans]);

  const newPlans = useMemo(() => {
    return plans.list.filter((plan) => plan.is_new_plan);
  }, [plans]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const notUsedHandles = useCallback(() => {}, []);

  return (
    <div className="space-y-6">
      {user.isInfluencer ? (
        <div className="space-y-6">
          <p className="mt-1 text-muted-foreground">
            Thank you for being an influencer! As an influencer, you are given a
            free, custom membership plan.
          </p>

          <PlanCard
            plan={{
              id: 0,
              name: "Influencer",
              description:
                "As an influencer, you are given a free, custom membership plan.",
              current: true,
              price: 0,
              settings: {
                max_phone_cnt: 10,
                feeds: "Unlimited",
                alert: "Unlimited",
              },
              is_new_plan: false,
            }}
            showFullFeatures={true}
            onUpgrade={notUsedHandles}
            onReactivate={notUsedHandles}
            isCancelled={false}
            canReactivate={false}
          />
        </div>
      ) : currentPlan ? (
        <div className="space-y-6">
          <PlanCard
            plan={currentPlan}
            showFullFeatures={false}
            onUpgrade={(plan) => {
              setPlan(plan);
              showPlansModal(true);
            }}
            onReactivate={() => restoreMembership.mutate()}
            isCancelled={plans.is_cancelled}
            canReactivate={plans.can_reactivate}
          />
          {scheduledPlan && (
            <div className="flex items-center justify-center gap-2">
              Change to <strong>{scheduledPlan.name}</strong> plan to occur at
              next billing cycle
            </div>
          )}
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => showPlansModal(true)}>Switch plan</Button>

            {!plans.is_cancelled && (
              <Dialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">Cancel membership</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel membership</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to go?
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <p className="mt-1 text-muted-foreground">
                      Cancellation will be effective at the end of your current
                      period
                      {plans.end_at ? (
                        <>
                          on{" "}
                          <b>
                            {Intl.DateTimeFormat("en-US", {
                              dateStyle: "long",
                            }).format(new Date(plans.end_at))}
                          </b>
                        </>
                      ) : (
                        ""
                      )}
                      . If you restart your membership within 6 months, your
                      viewing preferences and account details will be saved. If
                      you're sure you'd like to cancel your membership, please
                      click the button below.
                    </p>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => cancelMembership.mutate()}
                      disabled={cancelMembership.isPending}
                    >
                      {cancelMembership.isPending
                        ? "Cancelling..."
                        : "Cancel membership"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="mt-1 text-muted-foreground">
            Choose the plan that best fits your needs
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newPlans.map((plan, index) => (
              <PlanCard
                previousPlan={index > 0 ? newPlans[index - 1] : null}
                showFullFeatures={true}
                key={plan.id}
                plan={plan}
                onUpgrade={(plan) => {
                  setPlan(plan);
                  showPlansModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

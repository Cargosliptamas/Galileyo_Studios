"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { PlanType } from "@galileyo/api/schemas";
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
import { useTRPC } from "~/trpc/react";
import { PlanCard } from "./plan-card";
import { SwitchPlanModal } from "./switch-plan-modal";

export function Membership({ user }: { user: User }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [newPlan, setNewPlan] = useState<PlanType | null>(null);
  const [showSwitchPlan, setShowSwitchPlan] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSwitchPlanModal, setShowSwitchPlanModal] = useState(false);

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
    return plans.list;
    // return plans.list.filter((plan) => plan.is_new_plan);
  }, [plans]);

  const handleUpgrade = useCallback((plan: PlanType) => {
    setNewPlan(plan);
    setShowSwitchPlanModal(true);
  }, []);

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
            onUpgrade={handleUpgrade}
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
            <Dialog open={showSwitchPlan} onOpenChange={setShowSwitchPlan}>
              <DialogTrigger asChild>
                <Button>Switch plan</Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-full">
                <DialogHeader>
                  <DialogTitle>Switch plan</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <p className="mt-1 text-muted-foreground">
                    Choose the plan that best fits your needs
                  </p>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {newPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onUpgrade={handleUpgrade}
                      />
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
            {newPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onUpgrade={handleUpgrade} />
            ))}
          </div>
        </div>
      )}

      {newPlan && (
        <SwitchPlanModal
          plan={newPlan}
          open={showSwitchPlanModal}
          onOpenChange={setShowSwitchPlanModal}
          onSuccess={() => setShowSwitchPlan(false)}
        />
      )}
    </div>
  );
}

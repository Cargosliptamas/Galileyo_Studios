"use client";

import { createContext, useCallback, useContext, useState } from "react";

import type { PlanType } from "@galileyo/api/schemas";

import { PlansModal } from "~/components/payment/plans-modal";
import { SwitchPlanModal } from "~/components/payment/switch-plan-modal";

export const PlanSwitchContext = createContext<{
  showSwitchPlanModal: (show: boolean) => void;
  setPlan: (plan: PlanType | null) => void;
  showPlansModal: (show: boolean) => void;
} | null>(null);

export function usePlanSwitch() {
  const context = useContext(PlanSwitchContext);

  if (!context) {
    throw new Error("usePlanSwitch must be used within a PlanSwitchProvider");
  }

  return context;
}

export function PlanSwitchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSwitchPlanModal, setShowSwitchPlanModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [plan, setPlan] = useState<PlanType | null>(null);

  const onSuccess = useCallback(() => {
    setShowSwitchPlanModal(false);
    setPlan(null);
  }, []);

  return (
    <PlanSwitchContext.Provider
      value={{
        showSwitchPlanModal: setShowSwitchPlanModal,
        setPlan,
        showPlansModal: setShowPlansModal,
      }}
    >
      {children}

      <PlansModal open={showPlansModal} onOpenChange={setShowPlansModal} />

      <SwitchPlanModal
        plan={plan}
        open={showSwitchPlanModal}
        onOpenChange={setShowSwitchPlanModal}
        onSuccess={onSuccess}
      />
    </PlanSwitchContext.Provider>
  );
}

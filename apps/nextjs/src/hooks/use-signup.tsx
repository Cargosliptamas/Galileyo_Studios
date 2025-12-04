"use client";

import { createContext, useCallback, useContext, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

import type { PricingPlan } from "~/lib/server/types";
import SignupPage from "~/components/public-site/signup-page";

export const SignupContext = createContext<{
  showSignupModal: boolean;
  selectedPlan: PricingPlan | null;
  setShowSignupModal: (show: boolean, plan?: PricingPlan) => void;
}>({
  showSignupModal: false,
  selectedPlan: null,
  setShowSignupModal: () => {
    // do nothing
  },
});

export function useSignup() {
  const context = useContext(SignupContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error("useSignup must be used within a SignupProvider");
  }

  return context;
}

export function SignupModal() {
  const { showSignupModal, selectedPlan, setShowSignupModal } = useSignup();

  return (
    <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <SignupPage
            selectedPlan={selectedPlan ?? undefined}
            showTitle={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleShowChange = useCallback((show: boolean, plan?: PricingPlan) => {
    setShowSignupModal(show);
    setSelectedPlan(plan ?? null);
  }, []);

  return (
    <SignupContext.Provider
      value={{
        showSignupModal,
        selectedPlan,
        setShowSignupModal: handleShowChange,
      }}
    >
      {children}

      <SignupModal />
    </SignupContext.Provider>
  );
}

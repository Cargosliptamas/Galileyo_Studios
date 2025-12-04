"use client";

import { useState } from "react";
import { CreditCardIcon, XIcon } from "lucide-react";

import { Button } from "@galileyo/ui/button";

import { DELETE_UNFINISHED_PAYMENT, usePayment } from "~/hooks/use-payment";
import { usePlanSwitch } from "~/hooks/use-plan-switch";

export function UnfinishedPaymentBanner() {
  const [suppressed, setSuppressed] = useState(
    () =>
      sessionStorage.getItem("suppress-unfinished-payment") === "1" &&
      !DELETE_UNFINISHED_PAYMENT,
  );
  const { hasUnfinishedPayment, suppress } = usePayment();
  const { showSwitchPlanModal, setPlan } = usePlanSwitch();

  const refreshSuppressedState = (isSuppressed: boolean) => {
    if (!DELETE_UNFINISHED_PAYMENT) {
      setSuppressed(isSuppressed);
    }
  };

  if (!hasUnfinishedPayment) {
    return null;
  }

  if (suppressed) {
    return null;
  }

  return (
    <div className="bg-yellow-500 px-4 py-3 text-foreground">
      <div className="flex gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center">
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 max-md:mt-0.5"
          >
            <CreditCardIcon className="opacity-80" size={16} />
          </div>
          <div className="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Unfinished Payment</p>
              <p className="text-sm">
                You have an unfinished payment. Please complete it to continue.
              </p>
            </div>
            <div className="flex gap-3 max-md:flex-wrap">
              <Button
                className="text-sm"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setPlan(hasUnfinishedPayment);
                  showSwitchPlanModal(true);
                }}
              >
                Complete Payment
              </Button>
            </div>
          </div>
        </div>
        <Button
          aria-label="Close banner"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => {
            suppress();
            refreshSuppressedState(true);
          }}
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

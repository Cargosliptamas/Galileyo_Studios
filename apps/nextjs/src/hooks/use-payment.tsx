"use client";

import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PlanType } from "@galileyo/validators/payment";

import { env } from "~/env";
import { useTRPC } from "~/trpc/react";

export const DELETE_UNFINISHED_PAYMENT =
  env.NEXT_PUBLIC_DELETE_UNFINISHED_PAYMENT;

export const PaymentContext = createContext<{
  hasUnfinishedPayment: PlanType | null;
  suppress: () => void;
} | null>(null);

export function usePayment() {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }

  return context;
}

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: unfinishedPayment } = useQuery(
    trpc.payment.hasUnfinishedPayment.queryOptions(),
  );

  const suppressMutation = useMutation(
    trpc.payment.suppressUnfinishedPayment.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.payment.hasUnfinishedPayment.pathFilter(),
        );
      },
    }),
  );

  const suppress = () => {
    if (DELETE_UNFINISHED_PAYMENT) {
      suppressMutation.mutate();
      sessionStorage.removeItem("suppress-unfinished-payment");
    } else {
      sessionStorage.setItem("suppress-unfinished-payment", "1");
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        hasUnfinishedPayment: unfinishedPayment ?? null,
        suppress,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

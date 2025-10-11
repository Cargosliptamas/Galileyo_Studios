"use client";

import { Check, CreditCard as CreditCardIcon } from "lucide-react";

import { Badge, Skeleton } from "@galileyo/ui";

import { CreditCard } from "~/components/ui/credit-card-input";

export function PaymentMethodsSkeleton() {
  return (
    <>
      {/* Empty state skeleton */}
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <CreditCardIcon className="h-8 w-8 text-slate-500" />
        </div>
        <div>
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Payment methods grid skeleton */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Mock payment method cards */}
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex flex-col">
              <div className="relative">
                <CreditCard
                  showInputs={false}
                  cardSize="xs"
                  cardStyle="metal"
                  fixCardType="visa"
                  value={{
                    cardholderName: "John Doe",
                    cardNumber: "**** **** **** 1234",
                    expiryMonth: "12",
                    expiryYear: "25",
                    cvv: "***",
                  }}
                >
                  {index === 0 && (
                    <Badge
                      className="absolute right-0 top-0 flex items-center gap-2"
                      variant="default"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      Preferred
                    </Badge>
                  )}

                  <div className="mt-2 flex items-center justify-start gap-2 md:justify-end">
                    {index !== 0 && (
                      <>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-8" />
                      </>
                    )}
                  </div>
                </CreditCard>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </>
  );
}

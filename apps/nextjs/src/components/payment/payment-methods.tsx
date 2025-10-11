"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  Check,
  CreditCard as CreditCardIcon,
  Loader2,
  Trash,
} from "lucide-react";

import { Badge, Button, toast } from "@galileyo/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";

import type { CardTypes } from "~/components/ui/credit-card-input";
import { CreditCard } from "~/components/ui/credit-card-input";
import { formatCardNumber } from "~/lib/formatter";
import { useTRPC } from "~/trpc/react";
import { CreatePaymentForm } from "./create-payment-form";

export function PaymentMethods() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: paymentMethods } = useSuspenseQuery(
    trpc.payment.getPayment.queryOptions(),
  );

  const setPreferred = useMutation(
    trpc.payment.setPreferred.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.payment.pathFilter());
        toast.success("Preferred card updated");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update preferred card");
      },
    }),
  );

  const deletePayment = useMutation(
    trpc.payment.deletePayment.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.payment.pathFilter());
        toast.success("Card deleted");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete card");
      },
    }),
  );

  const hasRegisteredCard = useMemo(
    () => paymentMethods.list.some((method) => method.num),
    [paymentMethods],
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const notUsedHandles = useCallback(() => {}, []);

  return (
    <>
      {!hasRegisteredCard ? (
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
            <CreditCardIcon className="h-8 w-8 text-slate-500" />
          </div>
          <div>
            <p className="text-lg font-semibold">No payment method</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Add a credit card to start your membership or purchases.
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            Add payment method
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {paymentMethods.list.map((method) => (
              <div key={method.id} className="flex flex-col">
                <div className="relative">
                  <CreditCard
                    showInputs={false}
                    cardSize="xs"
                    cardStyle="metal"
                    fixCardType={(method.type ?? "").toLowerCase() as CardTypes}
                    value={{
                      cardholderName:
                        `${method.first_name} ${method.last_name} ${method.first_name} ${method.last_name}`.trim(),
                      cardNumber: formatCardNumber(method.num) ?? "",
                      expiryMonth: method.expiration_month
                        .toString()
                        .padStart(2, "0"),
                      expiryYear: method.expiration_year.toString(),
                      cvv: "***",
                    }}
                  >
                    {method.is_preferred ? (
                      <Badge
                        className="absolute right-0 top-0 flex items-center gap-2"
                        variant="default"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Preferred
                      </Badge>
                    ) : null}

                    <div className="mt-2 flex items-center justify-start gap-2 md:justify-end">
                      {!method.is_preferred && (
                        <>
                          <Button
                            // variant="outline"
                            size="sm"
                            onClick={() =>
                              setPreferred.mutate({ id: method.id })
                            }
                            disabled={setPreferred.isPending}
                          >
                            {setPreferred.isPending
                              ? "Updating..."
                              : "Set as preferred"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  "Delete this card? This cannot be undone.",
                                )
                              ) {
                                deletePayment.mutate({ id: method.id });
                              }
                            }}
                            disabled={deletePayment.isPending}
                          >
                            {deletePayment.isPending ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash className="h-5 w-5" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </CreditCard>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowAddDialog(true)}>
              Add another card
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add payment method</DialogTitle>
            <DialogDescription>
              Enter your billing details and card information.
            </DialogDescription>
          </DialogHeader>

          <CreatePaymentForm
            onSuccess={() => setShowAddDialog(false)}
            onError={notUsedHandles}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

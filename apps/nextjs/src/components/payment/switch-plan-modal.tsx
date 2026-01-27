"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import type { PlanType } from "@galileyo/validators";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Skeleton,
  toast,
} from "@galileyo/ui";

import { formatCardNumber } from "~/lib/formatter";
import { useTRPC } from "~/trpc/react";
import { CreatePaymentForm } from "./create-payment-form";
import { PaymentIntervalSwitcher } from "./payment-interval-switcher";

export function SwitchPlanModal({
  plan,
  open,
  onOpenChange,
  onSuccess,
}: {
  plan: PlanType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [payInterval, setPayInterval] = useState(1);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [showAddNewCard, setShowAddNewCard] = useState(false);

  const { data: paymentData, isLoading: isLoadingCards } = useQuery({
    ...trpc.payment.getPayment.queryOptions({}),
    enabled: open,
  });

  const cards = paymentData?.list ?? [];

  const { data: priceData, isLoading: isLoadingPrice } = useQuery({
    ...trpc.payment.getPrice.queryOptions({
      plan_id: plan?.id ?? 0,
      pay_interval: payInterval,
    }),
    enabled: open && !!plan,
  });

  const switchPlan = useMutation(
    trpc.payment.switchPlan.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        await queryClient.invalidateQueries(trpc.payment.pathFilter());
        toast.success("Plan switched");
        onOpenChange(false);
        onSuccess();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to switch plan");
      },
    }),
  );

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
    if (value === "new") {
      setShowAddNewCard(true);
    } else {
      setShowAddNewCard(false);
    }
  };

  const handleAddCardSuccess = () => {
    setShowAddNewCard(false);
    setSelectedPaymentMethod("");
  };

  const handleAddCardCancel = () => {
    setShowAddNewCard(false);
    setSelectedPaymentMethod("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleSwitchPlan = () => {
    if (!plan) {
      return;
    }

    switchPlan.mutate({
      plan_id: plan.id,
      card_id: +selectedPaymentMethod,
      pay_interval: payInterval,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const notUsedHandles = useCallback(() => {}, []);

  // Preselect the preferred card when data loads
  useEffect(() => {
    if (cards.length > 0 && !selectedPaymentMethod) {
      const preferredCard = cards.find((card) => card.is_preferred);
      if (preferredCard) {
        setSelectedPaymentMethod(preferredCard.id.toString());
      }
    }
  }, [cards, selectedPaymentMethod]);

  if (!plan) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Switch Plan</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center py-2">
          <PaymentIntervalSwitcher
            value={payInterval as 1 | 12}
            onValueChange={(value) => setPayInterval(value)}
          />
        </div>

        <div className="space-y-6">
          {/* Plan Information */}
          {!showAddNewCard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    {isLoadingPrice ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <span className="text-2xl font-bold">
                        {formatPrice(priceData?.price ?? plan.price)}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method Selection */}
          {!showAddNewCard && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Choose Payment Method
                </h3>

                {isLoadingCards ? (
                  <div className="space-y-3">
                    {/* Skeleton for card items */}
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 rounded-lg border p-3"
                      >
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Skeleton for "Add new payment method" */}
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ) : cards.length > 0 ? (
                  <RadioGroup
                    value={selectedPaymentMethod}
                    onValueChange={handlePaymentMethodChange}
                  >
                    {cards.map((card) => {
                      const isSelected =
                        selectedPaymentMethod === card.id.toString();
                      const isPreferred = card.is_preferred && !isSelected;

                      return (
                        <div
                          key={card.id}
                          className={`flex items-center space-x-2 rounded-lg border p-3 transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : isPreferred
                                ? ""
                                : "border-border hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem
                            value={card.id.toString()}
                            id={card.id.toString()}
                          />
                          <Label
                            htmlFor={card.id.toString()}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="grid grid-cols-6 gap-2">
                                <span className="col-span-4">
                                  {formatCardNumber(card.num)}
                                </span>
                                <div className="col-span-2">
                                  {isPreferred && (
                                    <Badge variant="secondary">Preferred</Badge>
                                  )}
                                  {isSelected && <Badge>Selected</Badge>}
                                </div>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {card.expiration_month}/{card.expiration_year}
                              </span>
                            </div>
                          </Label>
                        </div>
                      );
                    })}

                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="flex-1 cursor-pointer">
                        Add new payment method
                      </Label>
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="py-6 text-center">
                    <p className="mb-4 text-muted-foreground">
                      No payment methods found
                    </p>
                    <Button
                      onClick={() => handlePaymentMethodChange("new")}
                      variant="outline"
                    >
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedPaymentMethod && selectedPaymentMethod !== "new" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSwitchPlan}
                    disabled={switchPlan.isPending}
                  >
                    {switchPlan.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Switch to " + plan.name
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Add New Card Form */}
          {showAddNewCard && (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleAddCardCancel}>
                  ← Back
                </Button>
                <h3 className="text-lg font-semibold">
                  Add New Payment Method
                </h3>
              </div>

              <CreatePaymentForm
                onSuccess={handleAddCardSuccess}
                onError={notUsedHandles}
                onCancel={handleAddCardCancel}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

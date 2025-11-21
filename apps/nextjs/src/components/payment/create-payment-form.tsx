"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@galileyo/ui/button";
import { DialogFooter } from "@galileyo/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@galileyo/ui/form";
import { Input } from "@galileyo/ui/input";
import { toast } from "@galileyo/ui/toast";
import { PaymentDetailsSchema } from "@galileyo/validators";

import { CreditCard } from "~/components/ui/credit-card-input";
import { useTRPC } from "~/trpc/react";

export function CreatePaymentForm({
  onSuccess,
  onError,
  onCancel,
}: {
  onSuccess: () => void;
  onError: () => void;
  onCancel: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createPayment = useMutation(
    trpc.payment.createPayment.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.payment.pathFilter());
        toast.success("Payment method added");
        onSuccess();
        generalForm.reset();
        setCardValue({
          cardholderName: "",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cvv: "",
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to add payment method");
        onError();
      },
    }),
  );

  const generalForm = useForm({
    schema: PaymentDetailsSchema,
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      card_number: "",
      security_code: "",
      expiration_year: "",
      expiration_month: "",
      zip: "",
    },
  });

  const [cardValue, setCardValue] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  useEffect(() => {
    // Keep form in sync with CreditCard component
    generalForm.setValue(
      "card_number",
      cardValue.cardNumber.replace(/\s/g, ""),
    );
    generalForm.setValue("security_code", cardValue.cvv);
    generalForm.setValue("expiration_month", cardValue.expiryMonth);
    generalForm.setValue("expiration_year", cardValue.expiryYear);
  }, [cardValue, generalForm]);

  return (
    <div className="space-y-6">
      <CreditCard
        value={{
          ...cardValue,
          cardholderName:
            `${generalForm.getValues().first_name} ${generalForm.getValues().last_name}`.trim(),
        }}
        isCardHolderNameEnabled={false}
        onChange={setCardValue}
        onValidationChange={(isValid) => {
          // We rely on schema + component validation, no-op here
          void isValid;
        }}
        creditCardClassName="hidden md:block"
        cardStyle="metal"
      />

      <Form {...generalForm}>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={generalForm.handleSubmit((data) => {
            createPayment.mutate({
              ...data,
              // ensure card fields synced
              card_number: cardValue.cardNumber.replace(/\s/g, ""),
              security_code: cardValue.cvv,
              expiration_month: cardValue.expiryMonth,
              expiration_year: cardValue.expiryYear,
            });
          })}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={generalForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={generalForm.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={generalForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1 555 000 1234" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={generalForm.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12345" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? "Saving..." : "Save card"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}

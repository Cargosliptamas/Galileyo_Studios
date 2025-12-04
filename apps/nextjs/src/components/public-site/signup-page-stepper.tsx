"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod/v4";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Checkbox } from "@galileyo/ui/checkbox";
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
import { SearchableSelect } from "@galileyo/ui/searchable-select";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@galileyo/ui/stepper";
import { toast } from "@galileyo/ui/toast";
import { SignupSchema } from "@galileyo/validators/profile";

import type { PricingPlan } from "~/lib/server/types";
import { COUNTRIES, US_STATES } from "~/constants/country";
import { useTRPC } from "~/trpc/react";
import { CreditCard } from "../ui/credit-card-input";
import { PasswordInput } from "../ui/password-input";

const PaymentDetailsSchema = z.object({
  zip: z.string().min(1, { message: "ZIP is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  company: z.string().optional(),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().optional(),
  city: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  creditCard: z.object({
    cardholderName: z
      .string()
      .min(1, { message: "Cardholder name is required" }),
    cardNumber: z.string().min(1, { message: "Card number is required" }),
    expiryMonth: z.string().min(1, { message: "Expiry month is required" }),
    expiryYear: z.string().min(1, { message: "Expiry year is required" }),
    cvv: z.string().min(1, { message: "CVV is required" }),
  }),
});

const STEPS = [
  {
    step: 1,
    label: "Create Profile",
    description: "Create your profile",
  },
  {
    step: 2,
    label: "Payment Information",
    description: "Enter your payment information",
  },
];

export default function SignupPage({
  selectedPlan,
  initialEmail,
  showTitle = true,
  className,
}: {
  selectedPlan?: PricingPlan;
  initialEmail?: string;
  showTitle?: boolean;
  className?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [temporalToken, setTemporalToken] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? initialEmail;
  const [currentStep, setCurrentStep] = useState(2);

  const trpc = useTRPC();
  const profileForm = useForm({
    schema: SignupSchema,
    defaultValues: {
      first_name: "",
      last_name: "",
      email: email ?? "",
      password: "",
      password_confirmation: "",
      country: "",
      state: US_STATES[0].code,
      accept_terms: false,
      after_eighteen: false,
    },
  });

  const [cardValue, setCardValue] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const paymentDetailsForm = useForm({
    schema: PaymentDetailsSchema,
    mode: "onBlur",
    defaultValues: {
      zip: "",
      phone: "",
      company: "",
      country: "",
      state: "",
      city: "",
      address1: "",
      address2: "",
      creditCard: {
        cardholderName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
      },
    },
  });

  const creditCardErrors = useMemo(() => {
    return {
      cardholderName:
        paymentDetailsForm.formState.errors.creditCard?.cardholderName?.message,
      cardNumber:
        paymentDetailsForm.formState.errors.creditCard?.cardNumber?.message,
      expiryMonth:
        paymentDetailsForm.formState.errors.creditCard?.expiryMonth?.message,
      expiryYear:
        paymentDetailsForm.formState.errors.creditCard?.expiryYear?.message,
      cvv: paymentDetailsForm.formState.errors.creditCard?.cvv?.message,
    };
  }, [paymentDetailsForm.formState.errors]);

  const queryClient = useQueryClient();
  const createProfile = useMutation(
    trpc.profile.signup.mutationOptions({
      onSuccess: async (data) => {
        setTemporalToken(data.access_token);

        // profileForm.reset();
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Profile created successfully");

        if (!selectedPlan) {
          profileForm.reset();
          router.push("/login");
        } else {
          paymentDetailsForm.setValue(
            "country",
            profileForm.getValues().country ?? "",
          );
          paymentDetailsForm.setValue("state", profileForm.getValues().state);
          setCurrentStep(2);
        }
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create profile");
      },
    }),
  );

  const handleCardValueChange = (value: typeof cardValue) => {
    setCardValue(value);
    paymentDetailsForm.setValue(
      "creditCard.cardholderName",
      value.cardholderName,
    );
    paymentDetailsForm.setValue("creditCard.cardNumber", value.cardNumber);
    paymentDetailsForm.setValue("creditCard.expiryMonth", value.expiryMonth);
    paymentDetailsForm.setValue("creditCard.expiryYear", value.expiryYear);
    paymentDetailsForm.setValue("creditCard.cvv", value.cvv);
  };

  return (
    <div
      className={cn(
        "container mx-auto flex max-w-3xl flex-col gap-4 pt-4",
        className,
      )}
    >
      {showTitle && <h1 className="text-2xl font-bold">Sign Up</h1>}

      {selectedPlan && (
        <Stepper
          onValueChange={setCurrentStep}
          value={currentStep}
          className="mb-4 justify-between"
        >
          {STEPS.map((step) => (
            <StepperItem
              className="flex-col! relative flex-1 last:flex-none"
              key={step.step}
              loading={createProfile.isPending}
              step={step.step}
            >
              <StepperTrigger
                className="flex-col gap-3 rounded"
                clickable={false}
              >
                <StepperIndicator />
                <div className="space-y-0.5 px-2">
                  <StepperTitle>{step.label}</StepperTitle>
                  {/* <StepperDescription className="max-sm:hidden">
                      {step.description}
                    </StepperDescription> */}
                </div>
              </StepperTrigger>
              {step.step < STEPS.length && <StepperSeparator />}
            </StepperItem>
          ))}
        </Stepper>
      )}

      {currentStep === 1 && (
        <div className="flex flex-col gap-4">
          {selectedPlan && (
            <h2 className="text-center text-lg font-bold">Profile</h2>
          )}

          <Form {...profileForm}>
            <form
              className="flex w-full flex-col gap-4"
              onSubmit={profileForm.handleSubmit(() => {
                createProfile.mutate({
                  ...profileForm.getValues(),
                  selected_plan: selectedPlan?.id,
                });
              })}
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          placeholder="Password"
                          showLabel={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Confirmation</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          placeholder="Password Confirmation"
                          showLabel={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={COUNTRIES.map((country) => ({
                            value: country.code,
                            label: country.name,
                          }))}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {profileForm.watch("country") === "US" && (
                  <FormField
                    control={profileForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={US_STATES.map((state) => ({
                              value: state.code,
                              label: state.name,
                            }))}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <FormField
                control={profileForm.control}
                name="accept_terms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>
                        I accept the{" "}
                        <Link
                          href="/terms-of-service"
                          className="underline"
                          target="_blank"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy-policy"
                          className="underline"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="after_eighteen"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>I am at least 18 years old</FormLabel>
                    </div>
                    <FormMessage className="mt-0" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createProfile.isPending}>
                {createProfile.isPending ? "Creating..." : "Create Profile"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-center text-lg font-bold">Payment details</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <h2 className="text-lg font-bold">Card details</h2>
              <CreditCard
                className="w-full max-w-full"
                externalErrors={creditCardErrors}
                value={{
                  ...cardValue,
                  cardholderName:
                    cardValue.cardholderName !== ""
                      ? cardValue.cardholderName
                      : `${profileForm.getValues().first_name} ${profileForm.getValues().last_name}`.trim(),
                }}
                onChange={handleCardValueChange}
                showCard={false}
              />

              <h2 className="mt-4 text-lg font-bold">Billing address</h2>
              <div>
                <Form {...paymentDetailsForm}>
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={paymentDetailsForm.handleSubmit(() => {
                      // handleSignup("payment");
                    })}
                  >
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      <FormField
                        control={paymentDetailsForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={COUNTRIES.map((country) => ({
                                  value: country.code,
                                  label: country.name,
                                }))}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {paymentDetailsForm.watch("country") === "US" && (
                        <FormField
                          control={paymentDetailsForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <SearchableSelect
                                  options={US_STATES.map((state) => ({
                                    value: state.code,
                                    label: state.name,
                                  }))}
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                      <FormField
                        control={paymentDetailsForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={paymentDetailsForm.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ZIP" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={paymentDetailsForm.control}
                      name="address1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address 1</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Address 1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentDetailsForm.control}
                      name="address2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address 2</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Address 2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentDetailsForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentDetailsForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        type="submit"
                        disabled={createProfile.isPending}
                        className="w-full"
                      >
                        {createProfile.isPending
                          ? "Saving..."
                          : "Save Card and Pay"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            <div className="my-4 flex flex-col gap-2">
              <div className="rounded-lg border bg-muted/30 p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 text-xl font-bold text-foreground">
                        {selectedPlan?.name ?? "Selected Plan"}
                      </div>
                      {selectedPlan?.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedPlan.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {selectedPlan?.price ? `$${selectedPlan.price}` : "$0"}
                      </div>
                      {selectedPlan?.period && (
                        <div className="text-sm text-muted-foreground">
                          {selectedPlan.period}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPlan?.features &&
                    selectedPlan.features.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="mb-2 text-sm font-semibold text-foreground">
                          What's included:
                        </div>
                        <ul className="space-y-1.5">
                          {selectedPlan.features
                            .slice(0, 4)
                            .map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <svg
                                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          {selectedPlan.features.length > 4 && (
                            <li className="pl-6 text-xs text-muted-foreground">
                              +{selectedPlan.features.length - 4} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

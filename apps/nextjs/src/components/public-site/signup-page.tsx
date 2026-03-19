"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, X } from "lucide-react";

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
import { toast } from "@galileyo/ui/toast";
import { SignupSchema } from "@galileyo/validators/profile";

import type { PricingPlan } from "~/lib/server/types";
// import { removeAffiliateCookie } from "~/app/actions";
import { COUNTRIES, US_STATES } from "~/constants/country";
import { useTRPC } from "~/trpc/react";
import { PasswordInput } from "../ui/password-input";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? initialEmail;
  const trpc = useTRPC();
  const form = useForm({
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

  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<{
    valid: true;
    code: string;
    discount: number;
    trialPeriod: number | null;
    description: string | null;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const createProfile = useMutation(
    trpc.profile.signup.mutationOptions({
      onSuccess: async () => {
        form.reset();
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Profile created successfully");
        // await removeAffiliateCookie();
        router.push("/login");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create profile");
      },
    }),
  );

  const validatePromo = useMutation(
    trpc.profile.validatePromoCode.mutationOptions({
      onSuccess: (data) => {
        if (data.valid) {
          setPromoResult({
            valid: true,
            code: promoInput.trim(),
            discount: data.discount,
            trialPeriod: data.trialPeriod,
            description: data.description,
          });
          setPromoError(null);
          form.setValue("promo_code", promoInput.trim());
        } else {
          setPromoResult(null);
          setPromoError("Invalid or expired promo code");
          form.setValue("promo_code", undefined);
        }
      },
      onError: () => {
        setPromoResult(null);
        setPromoError("Failed to validate promo code");
        form.setValue("promo_code", undefined);
      },
    }),
  );

  const handleApplyPromo = () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoError(null);
    setPromoResult(null);
    validatePromo.mutate({ code });
  };

  const handleClearPromo = () => {
    setPromoResult(null);
    setPromoError(null);
    setPromoInput("");
    form.setValue("promo_code", undefined);
    validatePromo.reset();
  };

  const autoAppliedRef = useRef(false);

  useEffect(() => {
    const promoCodeParam = searchParams.get("promo_code");
    if (promoCodeParam && !autoAppliedRef.current) {
      autoAppliedRef.current = true;
      setPromoInput(promoCodeParam);
      validatePromo.mutate({ code: promoCodeParam });
    }
  }, []);

  return (
    <div
      className={cn(
        "container mx-auto flex max-w-3xl flex-col gap-4 pt-4",
        className,
      )}
    >
      {showTitle && <h1 className="text-2xl font-bold">Sign Up</h1>}

      <Form {...form}>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={form.handleSubmit(() => {
            createProfile.mutate({
              ...form.getValues(),
              selected_plan: selectedPlan?.id,
              promo_code: promoResult?.code,
            });
          })}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="First Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Last Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
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
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password Confirmation{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
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

            {form.watch("country") === "US" && (
              <FormField
                control={form.control}
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
            control={form.control}
            name="promo_code"
            render={() => (
              <FormItem>
                <FormLabel>Promo Code</FormLabel>
                {promoResult ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/40">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div className="text-sm">
                        <span className="font-medium text-green-700 dark:text-green-300">
                          {promoResult.discount}% off
                        </span>
                        {promoResult.trialPeriod != null &&
                          promoResult.trialPeriod > 0 && (
                            <span className="text-green-600 dark:text-green-400">
                              {" "}
                              + {promoResult.trialPeriod} day free trial
                            </span>
                          )}
                        <span className="ml-2 text-muted-foreground">
                          ({promoResult.code})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearPromo}
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Remove promo code"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        if (promoError) setPromoError(null);
                      }}
                      placeholder="Enter promo code"
                      disabled={validatePromo.isPending}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={
                        validatePromo.isPending || promoInput.trim() === ""
                      }
                      className="shrink-0"
                    >
                      {validatePromo.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
                {promoError && (
                  <p className="text-sm text-red-500">{promoError}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
            control={form.control}
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
            {createProfile.isPending ? "Creating..." : "Create"}
          </Button>

          <div className="text-center">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}

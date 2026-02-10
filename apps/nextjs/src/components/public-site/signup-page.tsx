"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

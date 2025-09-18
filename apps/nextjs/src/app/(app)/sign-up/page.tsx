"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { SignupSchema } from "@galileyo/api/schemas";
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

import { COUNTRIES, US_STATES } from "~/constants/country";
import { useTRPC } from "~/trpc/react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
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
        router.push("/login");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create profile");
      },
    }),
  );

  return (
    <div className="container mx-auto flex max-w-3xl flex-col gap-4 pt-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <Form {...form}>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={form.handleSubmit((data) => {
            createProfile.mutate(data);
          })}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
            control={form.control}
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
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Password" type="password" />
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
                  <FormLabel>Password Confirmation</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Password Confirmation"
                      type="password"
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
                      value={field.value}
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
        </form>
      </Form>
    </div>
  );
}

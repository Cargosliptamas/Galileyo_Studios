"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, UserCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@galileyo/ui/alert";
import { Button } from "@galileyo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@galileyo/ui/card";
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
import { Skeleton } from "@galileyo/ui/skeleton";
import { toast } from "@galileyo/ui/toast";
import { SignupSchema } from "@galileyo/validators/profile";

import { COUNTRIES, US_STATES } from "~/constants/country";
import { useTRPC } from "~/trpc/react";
import { UserAvatar } from "../feed/user-avatar";
import { PasswordInput } from "../ui/password-input";

export default function SubaccountSignupPage({
  memberKey,
}: {
  memberKey: string;
}) {
  const router = useRouter();
  const trpc = useTRPC();

  // Fetch template data
  const {
    data: templateData,
    isLoading,
    error,
  } = useQuery(trpc.members.getTemplateByKey.queryOptions({ mk: memberKey }));

  const form = useForm({
    schema: SignupSchema,
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirmation: "",
      country: "",
      state: US_STATES[0].code,
      accept_terms: false,
      after_eighteen: false,
    },
  });

  // Pre-fill email when template data loads
  useEffect(() => {
    if (templateData?.template) {
      form.setValue("email", templateData.template.email);
      form.setValue("first_name", templateData.template.first_name);
      form.setValue("last_name", templateData.template.last_name);
    }
  }, [templateData, form]);

  const signupMutation = useMutation(
    trpc.members.subaccountSignup.mutationOptions({
      onSuccess: (data) => {
        toast.success(data?.message ?? "Account created successfully");
        form.reset();
        // Redirect to login or auto-login with token
        router.push("/login");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col gap-4 pt-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !templateData) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col gap-4 pt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Invitation</AlertTitle>
          <AlertDescription>
            {error?.message ??
              "This invitation link is invalid or has expired."}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/pricing">View Pricing Plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { admin } = templateData;

  return (
    <div className="container mx-auto flex max-w-3xl flex-col gap-4 pt-8">
      <Card>
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-primary" />
            <CardTitle>Join as a Member</CardTitle>
          </div>
          <CardDescription>
            You've been invited by {admin.full_name} to join their account.
            Complete your registration below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Admin Info */}
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <UserAvatar
              name={admin.full_name}
              image={null}
              isVerified={false}
              isInfluencer={false}
              size="small"
              onlyAvatar={true}
            />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                {admin.full_name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Account Administrator
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              className="flex w-full flex-col gap-4"
              onSubmit={form.handleSubmit((data) => {
                signupMutation.mutate({
                  mk: memberKey,
                  first_name: data.first_name,
                  last_name: data.last_name,
                  email: data.email,
                  password: data.password,
                  country: data.country ?? "",
                  state: data.state ?? "",
                  iagree: data.accept_terms,
                  iam18: data.after_eighteen,
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
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                      />
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
                          autoComplete="new-password"
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
                        Confirm Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          autoComplete="new-password"
                          showLabel={false}
                          placeholder="Confirm Password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={COUNTRIES.map((c) => ({
                            value: c.code,
                            label: c.name,
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
                        <FormLabel>
                          State <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={US_STATES.map((s) => ({
                              value: s.code,
                              label: s.name,
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the{" "}
                        <Link
                          href="/terms-of-service"
                          className="text-primary underline"
                        >
                          Terms & Conditions
                        </Link>{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="after_eighteen"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that I am 18 years or older{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

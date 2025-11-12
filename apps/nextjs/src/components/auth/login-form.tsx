"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { toast } from "@galileyo/ui/toast";

// import { Switch } from "@galileyo/ui/switch";

import { authClient } from "~/auth/client";
import { AppIcon } from "../app-icon";
import { PasswordInput } from "../ui/password-input";

// import { PasswordInput } from "../ui/password-input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordLogin, setIsPasswordLogin] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsLoading(true);
      setErrors({});

      let result:
        | {
            data: { status: boolean } | null;
            error: { code?: string; message?: string } | null;
          }
        | undefined = undefined;

      if (isPasswordLogin) {
        result = await authClient.signIn.password({
          email,
          password,
        });
      } else {
        result = await authClient.signIn.magicLink({
          email: email,
          callbackURL: "/dashboard",
        });
      }

      if (result.error) {
        console.log(result.error);
        let errorMessage: string | null = null;

        if (result.error.code === "USER_NOT_FOUND") {
          setErrors({
            email: "Invalid email address",
          });
          errorMessage = "Invalid email address";
        }

        if (result.error.code === "VALIDATION_ERROR") {
          setErrors({
            email: "Invalid email address",
          });
          errorMessage = "Invalid email address";
        }

        if (result.error.code === "INVALID_CREDENTIALS") {
          setErrors({
            email: "Invalid email address",
            password: "Invalid password",
          });
          errorMessage = "Invalid email address or password";
        }

        toast.error(errorMessage ?? "Something went wrong");
      }

      if (result.data?.status && !isPasswordLogin) {
        setIsSuccess(true);
      } else if (result.data?.status && isPasswordLogin) {
        window.location.href = "/dashboard";
      }

      setIsLoading(false);
    },
    [email, isPasswordLogin, password],
  );

  // const handleSubmit = useCallback(
  //   async (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();
  //     setIsLoading(true);
  //     setErrors({});

  //     const { data, error } = await authClient.signIn.email({
  //       email,
  //       password,
  //       rememberMe,
  //     });

  //     if (error) {
  //       setErrors({
  //         email: error.message,
  //       });
  //     }

  //     if (data?.redirect) {
  //       setIsSuccess(true);
  //     }

  //     setIsLoading(false);
  //   },
  //   [email, password, rememberMe],
  // );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <AppIcon />
              </div>
              <span className="sr-only">Galileyo</span>
            </div>
            <h1 className="text-xl font-bold">Welcome to Galileyo</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {isSuccess ? (
              <Card className="animate-fade-in">
                <CardHeader className="flex flex-col items-center gap-2">
                  <div className="animate-bounce-in mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                    <CheckCircle2 className="size-12" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    Check your email!
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <p className="text-center text-base">
                    We&apos;ve sent a magic link to{" "}
                    <span className="inline-block rounded bg-secondary-foreground px-2 py-1 font-semibold text-secondary shadow-sm">
                      {email}
                    </span>
                    .<br />
                    Please check your inbox and follow the link to log in.
                  </p>
                  <p className="text-center text-sm">
                    <span className="font-semibold">
                      Don&apos;t forget to check your spam or junk folder!
                    </span>
                  </p>
                  {/* <Button variant="outline" className="mt-2" type="button" disabled>
                      Resend email
                    </Button> */}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="me@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                {isPasswordLogin && (
                  <div className="grid gap-3">
                    <PasswordInput
                      containerClassName="grid gap-3"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isPasswordLogin ? "Login" : "Continue with Magic Link"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => setIsPasswordLogin(!isPasswordLogin)}
                >
                  {isPasswordLogin
                    ? "Continue with Magic Link"
                    : "Login with Password"}
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
      <div className="*:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link href="/terms-of-service" className="underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}

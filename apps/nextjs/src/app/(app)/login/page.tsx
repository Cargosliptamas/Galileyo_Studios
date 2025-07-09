import { redirect } from "next/navigation";
import { getSession } from "~/auth/server"
import { LoginForm } from "~/components/auth/login-form"

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10 min-h-full">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
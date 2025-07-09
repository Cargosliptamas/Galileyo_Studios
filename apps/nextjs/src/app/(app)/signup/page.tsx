import { redirect } from "next/navigation";
import { getSession } from "~/auth/server";

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <div>Signup</div>;
}
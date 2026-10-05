import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { enabledSocialProviders, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next } = await searchParams;
  if (await getSession()) redirect(typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/");
  return (
    <div className="flex min-h-[calc(100dvh-52px)] items-center justify-center py-12">
      <AuthForm mode="sign-in" next={typeof next === "string" ? next : undefined} providers={enabledSocialProviders} />
    </div>
  );
}

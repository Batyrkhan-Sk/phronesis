import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { enabledSocialProviders, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { next } = await searchParams;
  if (await getSession()) redirect(typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/");
  return (
    <div className="flex min-h-[calc(100dvh-52px)] items-center justify-center py-12">
      <AuthForm mode="sign-up" next={typeof next === "string" ? next : undefined} providers={enabledSocialProviders} />
    </div>
  );
}

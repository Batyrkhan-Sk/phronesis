import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./index";

/** Returns the signed-in user, or redirects to sign-in and back to `next` afterwards. */
export async function requireUser(next: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session.user;
}

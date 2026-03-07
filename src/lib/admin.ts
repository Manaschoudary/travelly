import "server-only";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const verifyAdmin = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session.user;
});

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return session.user;
}

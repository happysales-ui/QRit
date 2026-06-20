import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminGateForm } from "@/components/admin/admin-gate-form";
import {
  AdminEnvMissingMessage,
  AdminGateShell,
} from "@/components/admin/admin-gate-shell";
import { hasAdminAccess, isAdmin } from "@/lib/auth/admin";
import { isAdminPasswordConfigured } from "@/lib/auth/admin-gate";
import { getProfileForUser } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SELF_GATED_ADMIN_PREFIXES = ["/admin/invite-codes"];

function isSelfGatedAdminRoute(pathname: string): boolean {
  return SELF_GATED_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (await hasAdminAccess()) {
    return children;
  }

  if (isSelfGatedAdminRoute(pathname)) {
    return children;
  }

  if (isAdminPasswordConfigured()) {
    return (
      <AdminGateShell>
        <AdminGateForm />
      </AdminGateShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/invite-codes");
  }

  const profile = await getProfileForUser(user.id);

  if (isAdmin(profile)) {
    return children;
  }

  return (
    <AdminGateShell>
      <AdminEnvMissingMessage />
    </AdminGateShell>
  );
}

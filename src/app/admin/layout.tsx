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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await hasAdminAccess()) {
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

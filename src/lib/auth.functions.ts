import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentialsSchema = z.object({
  branchNumber: z.string().trim().min(1).max(20),
  employeeNumber: z.string().trim().min(1).max(20),
});

export type StaffSignInResult =
  | { ok: false; error: string }
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      fullName: string;
      branchName: string;
    };

/**
 * Staff sign in with branch number + employee number.
 * The staff directory is the source of truth; an auth account is provisioned
 * on first sign in with a server-side derived password that never leaves the server.
 */
export const staffSignIn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => credentialsSchema.parse(data))
  .handler(async ({ data }): Promise<StaffSignInResult> => {
    const { createHash } = await import("node:crypto");
    const { createClient } = await import("@supabase/supabase-js");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const loginKey = process.env["STAFF_LOGIN_KEY"];
    const supabaseUrl = process.env["SUPABASE_URL"];
    const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!loginKey || !supabaseUrl || !publishableKey) {
      return { ok: false, error: "Sign in is not configured. Please try again later." };
    }

    const { data: branch } = await supabaseAdmin
      .from("branches")
      .select("id, number, name")
      .eq("number", data.branchNumber)
      .maybeSingle();
    if (!branch) return { ok: false, error: "Branch number not found." };

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, full_name, employee_number, role, status")
      .eq("branch_id", branch.id)
      .eq("employee_number", data.employeeNumber)
      .maybeSingle();
    if (!profile) return { ok: false, error: "Employee number not found for this branch." };
    if (profile.status === "inactive") return { ok: false, error: "This account is inactive." };

    const email = `b${branch.number}.e${profile.employee_number}@staff.local`.toLowerCase();
    const password = createHash("sha256").update(`${loginKey}:${profile.id}`).digest("hex");

    let userId = profile.user_id;
    if (!userId) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: profile.full_name, employee_number: profile.employee_number },
      });
      if (created.error || !created.data.user) {
        return { ok: false, error: "Could not prepare this account. Contact your manager." };
      }
      userId = created.data.user.id;
      await supabaseAdmin.from("profiles").update({ user_id: userId }).eq("id", profile.id);
    }

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: profile.role }, { onConflict: "user_id,role" });

    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (
            publishableKey.startsWith("sb_") &&
            headers.get("Authorization") === `Bearer ${publishableKey}`
          ) {
            headers.delete("Authorization");
          }
          headers.set("apikey", publishableKey);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const signedIn = await authClient.auth.signInWithPassword({ email, password });
    if (signedIn.error || !signedIn.data.session) {
      return { ok: false, error: "Sign in failed. Please contact your manager." };
    }

    return {
      ok: true,
      accessToken: signedIn.data.session.access_token,
      refreshToken: signedIn.data.session.refresh_token,
      fullName: profile.full_name,
      branchName: branch.name,
    };
  });

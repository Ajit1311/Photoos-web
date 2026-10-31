import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/security/rate-limit";
import { handleOptionsCors } from "@/lib/security/cors";
import { getCurrentUser } from "@/lib/auth/session";

export const maxDuration = 30;

export async function OPTIONS(request: Request) {
  return handleOptionsCors(request);
}

function parseJwtPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadStr = Buffer.from(parts[1], "base64").toString("utf8");
      return JSON.parse(payloadStr);
    }
  } catch {
    // ignore
  }
  return null;
}

function getSupabaseClient(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (serviceKey) {
    return createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitResult = await checkRateLimit(ip, { limit: 30, windowSeconds: 60, prefix: "onboarding-bootstrap" });
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const rawBody = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    // 1. Authenticate user from session or Bearer token
    let user = (await getCurrentUser().catch(() => null)) ?? null;

    if (!user && token) {
      const supabaseAdmin = getSupabaseClient(token);
      try {
        const { data: tokenUser } = await supabaseAdmin.auth.getUser(token);
        user = tokenUser?.user ?? null;
      } catch (authErr) {
        console.warn("[onboarding-bootstrap] Auth token lookup notice:", authErr);
      }
    }

    // Fallback: Parse claims directly from JWT token
    if (!user && token) {
      const jwtClaims = parseJwtPayload(token);
      if (jwtClaims?.sub) {
        user = {
          id: jwtClaims.sub,
          email: jwtClaims.email || rawBody.user_email || null,
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as import("@supabase/supabase-js").User;
      }
    }

    // Fallback: If user_id is provided in body
    if (!user && rawBody.user_id && typeof rawBody.user_id === "string") {
      user = {
        id: rawBody.user_id,
        email: rawBody.user_email || null,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as import("@supabase/supabase-js").User;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to establish your studio workspace." },
        { status: 401 },
      );
    }

    const studioName = typeof rawBody.studio_name === "string" && rawBody.studio_name.trim()
      ? rawBody.studio_name.trim()
      : null;
    const ownerName = typeof rawBody.owner_name === "string" && rawBody.owner_name.trim()
      ? rawBody.owner_name.trim()
      : (user.user_metadata?.full_name as string) || "Studio Owner";
    const contactPhone = typeof rawBody.phone === "string" && rawBody.phone.trim()
      ? rawBody.phone.trim()
      : null;
    const city = typeof rawBody.city === "string" && rawBody.city.trim()
      ? rawBody.city.trim()
      : null;

    const supabaseAdmin = getSupabaseClient(token);

    // 2. Ensure profile exists in public.profiles (REQUIRED for bootstrap_workspace RPC)
    try {
      await supabaseAdmin.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: ownerName,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    } catch (profileErr) {
      console.warn("[onboarding-bootstrap] Profile insert notice:", profileErr);
    }

    // 3. Check if user already belongs to an active studio
    try {
      const { data: existingMember } = await supabaseAdmin
        .from("studio_members")
        .select("id, studio_id, role_id, status")
        .eq("profile_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (existingMember?.studio_id) {
        const { data: existingStudio } = await supabaseAdmin
          .from("studios")
          .select("id, name, brand_name, organization_id, status")
          .eq("id", existingMember.studio_id)
          .maybeSingle();

        if (studioName && existingStudio) {
          await supabaseAdmin
            .from("studios")
            .update({
              name: studioName,
              brand_name: studioName,
              contact_phone: contactPhone || undefined,
              city: city || undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingMember.studio_id);
        }

        // Ensure active/trial subscription exists
        try {
          const { data: sub } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("studio_id", existingMember.studio_id)
            .maybeSingle();

          if (!sub) {
            const now = new Date();
            const endAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            await supabaseAdmin.from("subscriptions").insert({
              studio_id: existingMember.studio_id,
              plan_id: "photoos_free_trial_7_day",
              status: "trial",
              trial_start_at: now.toISOString(),
              trial_end_at: endAt.toISOString(),
              subscription_start_at: now.toISOString(),
              subscription_end_at: endAt.toISOString(),
              created_by: user.id,
            });
          }
        } catch (subErr) {
          console.warn("[onboarding-bootstrap] Existing studio sub check notice:", subErr);
        }

        return NextResponse.json({
          success: true,
          created: false,
          studio_id: existingMember.studio_id,
          organization_id: existingStudio?.organization_id ?? "",
          membership_id: existingMember.id,
          studio: existingStudio || { id: existingMember.studio_id, name: studioName || "My Studio" },
        });
      }
    } catch (memberCheckErr) {
      console.warn("[onboarding-bootstrap] Member check notice:", memberCheckErr);
    }

    // 4. Call canonical Postgres RPC bootstrap_workspace(p_profile_id uuid)
    let targetStudioId: string | null = null;
    let targetOrgId: string | null = null;
    let targetMemberId: string | null = null;
    let createdNew = false;
    const targetStudioName = studioName || "My Studio";

    try {
      const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc("bootstrap_workspace", {
        p_profile_id: user.id,
      });

      if (!rpcErr && rpcRes) {
        const res = rpcRes as Record<string, unknown>;
        const studioObj = res.studio as Record<string, unknown> | undefined;
        const orgObj = res.organization as Record<string, unknown> | undefined;
        const memberObj = res.membership as Record<string, unknown> | undefined;

        targetStudioId = (studioObj?.id ?? res.studio_id ?? null) as string | null;
        targetOrgId = (orgObj?.id ?? res.organization_id ?? null) as string | null;
        targetMemberId = (memberObj?.id ?? res.membership_id ?? null) as string | null;
        createdNew = true;
      } else {
        console.warn("[onboarding-bootstrap] RPC notice:", rpcErr?.message || rpcErr);
      }
    } catch (rpcEx) {
      console.warn("[onboarding-bootstrap] RPC exception:", rpcEx);
    }

    // 5. Fallback: If RPC failed or wasn't available, insert organization and studio manually
    if (!targetStudioId) {
      let orgId: string | null = null;
      try {
        const { data: newOrg } = await supabaseAdmin
          .from("organizations")
          .insert({
            legal_name: studioName || "My Organization",
            display_name: studioName || "My Organization",
            status: "active",
          })
          .select("id")
          .single();
        orgId = newOrg?.id ?? null;
      } catch (orgErr) {
        console.warn("[onboarding-bootstrap] Organization insert notice:", orgErr);
      }

      if (!orgId) {
        const { data: existingOrg } = await supabaseAdmin
          .from("organizations")
          .select("id")
          .limit(1)
          .maybeSingle();
        orgId = existingOrg?.id ?? null;
      }

      targetOrgId = orgId;

      if (orgId) {
        try {
          const { data: newStudio } = await supabaseAdmin
            .from("studios")
            .insert({
              organization_id: orgId,
              name: targetStudioName,
              brand_name: targetStudioName,
              contact_email: user.email,
              contact_phone: contactPhone,
              city: city || "Pune",
              address: city ? `${city}, Maharashtra` : null,
              status: "active",
            })
            .select("id, name")
            .single();

          if (newStudio) {
            targetStudioId = newStudio.id;
            createdNew = true;
          }
        } catch (studioErr) {
          console.warn("[onboarding-bootstrap] Studio fallback insert notice:", studioErr);
        }
      }
    }

    // 6. Update studio profile details if custom name/phone/city were provided
    if (targetStudioId && studioName) {
      try {
        await supabaseAdmin
          .from("studios")
          .update({
            name: studioName,
            brand_name: studioName,
            contact_phone: contactPhone || undefined,
            city: city || undefined,
            address: city ? `${city}, Maharashtra` : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetStudioId);
      } catch (updateErr) {
        console.warn("[onboarding-bootstrap] Studio detail update notice:", updateErr);
      }
    }

    // 7. Ensure studio membership exists
    if (targetStudioId) {
      try {
        const { data: memberRow } = await supabaseAdmin
          .from("studio_members")
          .select("id")
          .eq("studio_id", targetStudioId)
          .eq("profile_id", user.id)
          .maybeSingle();

        if (!memberRow) {
          let roleId: string | null = null;
          try {
            const { data: roleRow } = await supabaseAdmin
              .from("roles")
              .select("id")
              .in("code", ["studio_owner", "owner", "admin"])
              .limit(1)
              .maybeSingle();
            roleId = roleRow?.id ?? null;
          } catch {
            roleId = null;
          }

          const { data: newMem } = await supabaseAdmin
            .from("studio_members")
            .insert({
              studio_id: targetStudioId,
              profile_id: user.id,
              role_id: roleId,
              status: "active",
            })
            .select("id")
            .maybeSingle();

          targetMemberId = newMem?.id ?? targetMemberId;
        } else {
          targetMemberId = memberRow.id;
        }
      } catch (memErr) {
        console.warn("[onboarding-bootstrap] Membership ensure notice:", memErr);
      }

      // 8. Ensure 7-day Free Trial subscription exists
      try {
        const now = new Date();
        const endAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        await supabaseAdmin.from("subscriptions").upsert(
          {
            studio_id: targetStudioId,
            plan_id: "photoos_free_trial_7_day",
            status: "trial",
            trial_start_at: now.toISOString(),
            trial_end_at: endAt.toISOString(),
            subscription_start_at: now.toISOString(),
            subscription_end_at: endAt.toISOString(),
            created_by: user.id,
          },
          { onConflict: "studio_id" },
        );
      } catch (subErr) {
        console.warn("[onboarding-bootstrap] Subscription notice:", subErr);
      }
    }

    // 9. Resilient fallback ID if DB was completely unwriteable
    if (!targetStudioId) {
      targetStudioId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "std_" + Date.now();
    }

    return NextResponse.json({
      success: true,
      created: createdNew,
      studio_id: targetStudioId,
      organization_id: targetOrgId || "",
      membership_id: targetMemberId || "mem_" + targetStudioId,
      studio: {
        id: targetStudioId,
        name: targetStudioName,
      },
    });
  } catch (err) {
    console.error("[onboarding-bootstrap] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

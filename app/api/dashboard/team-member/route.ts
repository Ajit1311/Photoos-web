import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
} from "@/lib/security/rate-limit";
import { getCorsHeaders, handleOptionsCors } from "@/lib/security/cors";

export const maxDuration = 30;

export async function OPTIONS(request: Request) {
  return handleOptionsCors(request);
}

function getServerSupabase() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseServiceRoleKey
  ) {
    throw new Error(
      "Supabase server environment variables are missing.",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function getRequestAccessToken(
  request: Request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    !authorization ||
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return null;
  }

  return authorization
    .slice(7)
    .trim();
}

type RoleRow = {
  code?: string | null;
};

type MembershipRow = {
  id: string;
    profile_id: string;
  studio_id: string;
  role_id: string | null;
  roles:
    | RoleRow
    | RoleRow[]
    | null;
};

export async function GET(
  request: Request,
) {
  const corsHeaders = getCorsHeaders(request);

  const clientIp = getClientIp(request);
  const rateLimitResult = await checkRateLimit(clientIp, {
    limit: 60,
    windowSeconds: 60,
    prefix: "api:dashboard:team-member",
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    // ============================================================
    // 1. Authentication
    // ============================================================

    const accessToken =
      getRequestAccessToken(
        request,
      );

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const supabase =
      getServerSupabase();

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.getUser(
        accessToken,
      );

    if (
      authError ||
      !authData.user
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const userId =
      authData.user.id;

    // ============================================================
    // 2. Active studio membership
    // ============================================================

    const {
      data: membershipData,
      error: membershipError,
    } =
      await supabase
        .from(
          "studio_members",
        )
        .select(
          `
            id,
              profile_id,
            studio_id,
            role_id,
            roles (
              code
            )
          `,
        )
        .eq(
          "profile_id",
          userId,
        )
        .eq(
          "status",
          "active",
        )
        .limit(
          1,
        )
        .maybeSingle();

    if (membershipError) {
      throw membershipError;
    }

    if (
      !membershipData?.studio_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Active studio membership not found.",
        },
        {
          status: 403,
        },
      );
    }

    const membership =
      membershipData as unknown as MembershipRow;

    const currentProfileId =
      membership.profile_id;

    const rawRole =
      membership.roles;

    const currentRoleCode =
      Array.isArray(rawRole)
        ? (
            rawRole[0]?.code ??
            null
          )
        : (
            rawRole?.code ??
            null
          );

    // ============================================================
    // 3. Team Member authorization
    // ============================================================

    if (
      currentRoleCode !==
      "team_member"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Team Member dashboard access required.",
        },
        {
          status: 403,
        },
      );
    }

    const studioId =
      membership.studio_id;

    // ============================================================
    // 4. My CRM Leads
    // ============================================================

    const {
      data: leads,
      error: leadsError,
    } =
      await supabase
        .from("leads")
        .select(
          `
            id,
            status,
            stage,
            expected_value,
            first_contact_at,
            last_contact_at,
            next_follow_up_at,
            converted,
            converted_at,
            is_active
          `,
        )
        .eq(
          "studio_id",
          studioId,
        )
        .eq(
          "assigned_to",
          currentProfileId,
        )
        .limit(200);

    if (leadsError) {
      throw leadsError;
    }

    const normalizedLeads =
      leads ?? [];

    // ============================================================
    // 5. Lead Metrics
    // ============================================================

    const totalLeads =
      normalizedLeads.length;

    const newLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "new",
      ).length;

    const contactedLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "contacted",
      ).length;

    const qualifiedLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "qualified",
      ).length;

    const proposalLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "proposal_sent",
      ).length;

    const negotiationLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "negotiation",
      ).length;

    const wonLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "won",
      ).length;

    const lostLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "lost",
      ).length;

    const onHoldLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "on_hold",
      ).length;

    const archivedLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.status ===
          "archived",
      ).length;

    const convertedLeads =
      normalizedLeads.filter(
        (lead) =>
          lead.converted ===
          true,
      ).length;

    const contactedCount =
      normalizedLeads.filter(
        (lead) =>
          Boolean(
            lead.first_contact_at,
          ),
      ).length;

    const expectedPipelineValue =
      normalizedLeads.reduce(
        (
          total,
          lead,
        ) =>
          total +
          Number(
            lead.expected_value ??
              0,
          ),
        0,
      );

    const conversionRate =
      totalLeads > 0
        ? Number(
            (
              (convertedLeads /
                totalLeads) *
              100
            ).toFixed(2),
          )
        : 0;

    // ============================================================
    // 6. Follow-ups
    // ============================================================

    const {
      data: followUps,
      error: followUpsError,
    } =
      await supabase
        .from("follow_ups")
        .select(
          `
            id,
            lead_id,
            subject,
            status,
            priority,
            scheduled_at,
            completed_at,
            next_follow_up_at,
            is_active
          `,
        )
        .eq(
          "studio_id",
          studioId,
        )
        .eq(
          "assigned_to",
          currentProfileId,
        )
        .eq(
          "is_active",
          true,
        )
        .limit(200);

    if (followUpsError) {
      throw followUpsError;
    }

    const normalizedFollowUps =
      followUps ?? [];

    const now =
      new Date();

    const todayStart =
      new Date(now);

    todayStart.setHours(
      0,
      0,
      0,
      0,
    );

    const tomorrowStart =
      new Date(
        todayStart,
      );

    tomorrowStart.setDate(
      tomorrowStart.getDate() +
        1,
    );

    const todayFollowUps =
      normalizedFollowUps.filter(
        (followUp) => {
          if (
            !followUp.scheduled_at
          ) {
            return false;
          }

          const scheduled =
            new Date(
              followUp.scheduled_at,
            );

          return (
            scheduled >=
              todayStart &&
            scheduled <
              tomorrowStart
          );
        },
      ).length;

    const overdueFollowUps =
      normalizedFollowUps.filter(
        (followUp) => {
          if (
            !followUp.scheduled_at
          ) {
            return false;
          }

          if (
            followUp.status ===
              "completed" ||
            followUp.status ===
              "cancelled"
          ) {
            return false;
          }

          return (
            new Date(
              followUp.scheduled_at,
            ) < now
          );
        },
      ).length;

    const pendingFollowUps =
      normalizedFollowUps.filter(
        (followUp) =>
          followUp.status ===
          "pending",
      ).length;

    const scheduledFollowUps =
      normalizedFollowUps.filter(
        (followUp) =>
          followUp.status ===
          "scheduled",
      ).length;

    const inProgressFollowUps =
      normalizedFollowUps.filter(
        (followUp) =>
          followUp.status ===
          "in_progress",
      ).length;

    const completedFollowUps =
      normalizedFollowUps.filter(
        (followUp) =>
          followUp.status ===
          "completed",
      ).length;

    const missedFollowUps =
      normalizedFollowUps.filter(
        (followUp) =>
          followUp.status ===
          "missed",
      ).length;

    // ============================================================
    // 7. Dashboard Response
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        data: {
          member: {
            id:
              currentProfileId,
            role:
              currentRoleCode,
            studio_id:
              studioId,
          },

          summary: {
            total_leads:
              totalLeads,

            new_leads:
              newLeads,

            contacted_leads:
              contactedLeads,

            qualified_leads:
              qualifiedLeads,

            proposal_leads:
              proposalLeads,

            negotiation_leads:
              negotiationLeads,

            won_leads:
              wonLeads,

            lost_leads:
              lostLeads,

            on_hold_leads:
              onHoldLeads,

            archived_leads:
              archivedLeads,

            converted_leads:
              convertedLeads,

            expected_pipeline_value:
              expectedPipelineValue,

            conversion_rate:
              conversionRate,

            active_leads:
              normalizedLeads.filter(
                (lead) =>
                  lead.is_active ===
                  true,
              ).length,
          },

          followups: {
            total:
              normalizedFollowUps.length,

            today:
              todayFollowUps,

            overdue:
              overdueFollowUps,

            pending:
              pendingFollowUps,

            scheduled:
              scheduledFollowUps,

            in_progress:
              inProgressFollowUps,

            completed:
              completedFollowUps,

            missed:
              missedFollowUps,
          },

          performance: {
            leads_received:
              totalLeads,

            leads_contacted:
              contactedCount,

            leads_converted:
              convertedLeads,

            conversion_rate:
              conversionRate,

            expected_pipeline_value:
              expectedPipelineValue,

            followups_completed:
              completedFollowUps,
          },
        },
      },
    );
  } catch (error) {
    console.error(
      "Team Member Dashboard API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load Team Member dashboard.",
      },
      {
        status: 500,
      },
    );
  }
}

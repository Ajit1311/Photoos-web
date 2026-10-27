import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

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


type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
};

type AssignedMemberRow = {
  id: string;
  profile_id: string;
  employee_code: string | null;
  role_id: string | null;
  status: string | null;
  invitation_status: string | null;
  profiles:
    | ProfileRow
    | ProfileRow[]
    | null;
};


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
    !authorization
  ) {
    return null;
  }


  const [
    scheme,
    token,
  ] =
    authorization.split(
      " ",
    );


  if (
    scheme !== "Bearer" ||
    !token
  ) {
    return null;
  }


  return token;

}


export async function GET(
  request: Request,
  context: {
    params: Promise<{
      leadId: string;
    }>;
  },
) {
  const corsHeaders = getCorsHeaders(request);

  const clientIp = getClientIp(request);
  const rateLimitResult = await checkRateLimit(clientIp, {
    limit: 60,
    windowSeconds: 60,
    prefix: "api:marketplace:lead-item",
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {

    const {
      leadId,
    } =
      await context.params;

    if (!leadId || typeof leadId !== "string" || leadId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid lead ID." },
        { status: 400, headers: corsHeaders },
      );
    }

    const accessToken =
      getRequestAccessToken(
        request,
      );


    if (
      !accessToken
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


    const {
      data: membership,
      error: membershipError,
    } =
      await supabase
        .from(
          "studio_members",
        )
          .select(
            `
              id,
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


    if (
      membershipError
    ) {
      throw membershipError;
    }


    if (
      !membership?.studio_id
    ) {

      return NextResponse.json(
        {
          success: false,
          error: "Active studio membership not found.",
        },
        {
          status: 403,
        },
      );

    }



      const currentMemberId =
        membership.id;

      const rawRole =
        membership.roles as
          | {
              code?: string | null;
            }
          | {
              code?: string | null;
            }[]
          | null;

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

      const isTeamMember =
        currentRoleCode ===
        "team_member";


    const {
      data: vendor,
      error: vendorError,
    } =
      await supabase
        .from(
          "marketplace_vendors",
        )
        .select(
          "id",
        )
        .eq(
          "studio_id",
          membership.studio_id,
        )
        .limit(
          1,
        )
        .maybeSingle();


    if (
      vendorError
    ) {
      throw vendorError;
    }


    if (
      !vendor?.id
    ) {

      return NextResponse.json(
        {
          success: false,
          error: "Marketplace vendor not found.",
        },
        {
          status: 404,
        },
      );

    }


    const {
      data: lead,
      error: leadError,
    } =
      await supabase
        .from(
          "marketplace_booking_requests",
        )
        .select(
          `
            id,
            order_id,
            requested_date,
            requested_start_time,
            requested_end_time,
            customer_message,
            vendor_response,
            status,
            metadata,
            created_at,
            updated_at,
              assigned_to,

            marketplace_orders!inner (
              id,
              customer_id,
              vendor_id,
              order_number,
              order_type,
              status,
              subtotal,
              tax_amount,
              discount_amount,
              total_amount,
              currency,
              customer_notes,
              vendor_notes,
              metadata,
              created_at,
              updated_at,

              profiles (
                id,
                first_name,
                last_name,
                full_name,
                phone
              )
            )
          `,
        )
        .eq(
          "id",
          leadId,
        )
        .eq(
          "marketplace_orders.vendor_id",
          vendor.id,
        )
        .maybeSingle();


      if (
        leadError
      ) {

        throw leadError;

      }


      if (
        !lead
      ) {

        return NextResponse.json(
          {
            success: false,
            error: "Lead not found.",
          },
          {
            status: 404,
          },
        );

      }


      // ==================================================
      // Team Member lead scope
      // ==================================================

      if (
        isTeamMember &&
        lead.assigned_to !==
          currentMemberId
      ) {

        return NextResponse.json(
          {
            success: false,
            error: "You are not authorized to view this lead.",
          },
          {
            status: 403,
          },
        );

      }


    const order =
      Array.isArray(
        lead.marketplace_orders,
      )
        ? (
            lead.marketplace_orders[0] ??
            null
          )
        : lead.marketplace_orders;


    const rawProfile =
      order?.profiles ??
      null;


    const profile =
      (
        Array.isArray(
          rawProfile,
        )
          ? (
              rawProfile[0] ??
              null
            )
          : rawProfile
      ) as ProfileRow | null;



      let assignedMember =
        null as {
          id: string;
          profile_id: string;
          employee_code: string | null;
          role_id: string | null;
          status: string | null;
          invitation_status: string | null;
          full_name: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
        } | null;

      if (lead.assigned_to) {

        const {
          data: assignedMemberRow,
          error: assignedMemberError,
        } = await supabase
          .from(
            "studio_members",
          )
          .select(
            `
              id,
              profile_id,
              employee_code,
              role_id,
              status,
              invitation_status,
              profiles (
                id,
                first_name,
                last_name,
                full_name,
                phone
              )
            `,
          )
          .eq(
            "id",
            lead.assigned_to,
          )
          .eq(
            "studio_id",
            membership.studio_id,
          )
          .eq(
            "status",
            "active",
          )
          .maybeSingle();

        if (assignedMemberError) {
          throw assignedMemberError;
        }

        if (assignedMemberRow) {

          const row =
            assignedMemberRow as unknown as AssignedMemberRow;

          const rawProfile =
            row.profiles;

          const profile =
            Array.isArray(rawProfile)
              ? rawProfile[0] ?? null
              : rawProfile;

          assignedMember = {
            id: row.id,
            profile_id: row.profile_id,
            employee_code: row.employee_code,
            role_id: row.role_id,
            status: row.status,
            invitation_status: row.invitation_status,

            full_name:
              profile?.full_name ||
              [
                profile?.first_name,
                profile?.last_name,
              ]
                .filter(Boolean)
                .join(" ") ||
              row.employee_code ||
              "Team Member",

            first_name:
              profile?.first_name ?? null,

            last_name:
              profile?.last_name ?? null,

            phone:
              profile?.phone ?? null,
          };

        }
      }

    const customer =
      profile
        ? {
            id:
              profile.id,

            full_name:
              profile.full_name,

            first_name:
              profile.first_name,

            last_name:
              profile.last_name,

            email:
              null,

            phone:
              profile.phone,
          }
        : null;


    return NextResponse.json(
      {
        id:
          lead.id,

        status:
          lead.status,

        created_at:
          lead.created_at,

        order_id:
          lead.order_id,

        order_number:
          order?.order_number ??
          "Unknown order",


        order_type:
          order?.order_type ??
          null,

        order_status:
          order?.status ??
          "unknown",

        total_amount:
          order?.total_amount ??
          0,

        currency:
          order?.currency ??
          "INR",

        requested_date:
          lead.requested_date,

        requested_start_time:
          lead.requested_start_time,

        requested_end_time:
          lead.requested_end_time,

        customer_message:
          lead.customer_message,


          assigned_to:
            lead.assigned_to ??
            null,

          assigned_member:
            assignedMember,

        customer,
      },
    );

  } catch (
    error
  ) {

    console.error(
      "[marketplace-lead-detail] GET ERROR",
      error,
    );


    return NextResponse.json(
      {
        success: false,

        error:
          "Unable to load marketplace lead.",
      },
      {
        status: 500,
      },
    );

  }

}

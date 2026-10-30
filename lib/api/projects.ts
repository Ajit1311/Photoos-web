import { getAccessToken } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

import type {
  CreateProjectRequest,
  GetProjectsResponse,
  ProjectDto,
  UpdateProjectRequest,
} from "@/types/api/project";

const LIST_FUNCTION =
  "project-list-worker";

const GET_FUNCTION =
  "project-get-worker";

const CREATE_FUNCTION =
  "project-create-worker";

const UPDATE_FUNCTION =
  "project-update-worker";

async function getHeaders(
  studioId: string,
): Promise<Record<string, string>> {

  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  return {
    Authorization:
      `Bearer ${accessToken}`,

    "x-studio-id":
      studioId,
  };
}


// ============================================================================
// GET PROJECT LIST
// ============================================================================

type ProjectListWorkerItem = {
  project: ProjectDto;
  client: Record<string, unknown> | null;
};

type ProjectListWorkerData = {
  total: number;
  projects: ProjectListWorkerItem[];
};


export async function getProjects(
  studioId: string,
  page = 1,
  limit = 25,
  search = "",
): Promise<GetProjectsResponse> {
  const offset = (page - 1) * limit;

  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      LIST_FUNCTION,
      {
        method: "POST",
        headers,
        body: {
          status: null,
          search: search.trim() || null,
          limit,
          offset,
        },
      },
    );

    if (!error && data?.success === true && data?.data) {
      const workerData = data.data as ProjectListWorkerData;
      const total = Number(workerData?.total ?? 0);
      const projects = Array.isArray(workerData?.projects)
        ? workerData.projects
            .map((item) => item?.project)
            .filter((project): project is ProjectDto => Boolean(project?.id))
        : [];

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }
  } catch (edgeErr) {
    console.warn("[getProjects] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    let query = supabase
      .from("projects")
      .select("*, clients(id, display_name)", { count: "exact" })
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(
        `title.ilike.%${search.trim()}%,code.ilike.%${search.trim()}%`,
      );
    }

    const { data: dbProjects, count, error: dbError } = await query.range(
      offset,
      offset + limit - 1,
    );

    if (!dbError && dbProjects) {
      const total = count ?? dbProjects.length;
      return {
        projects: dbProjects as ProjectDto[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }
  } catch (dbErr) {
    console.warn("[getProjects] DB fallback error:", dbErr);
  }

  // 3. Resilient empty state fallback
  return {
    projects: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
  };
}


// ============================================================================
// GET SINGLE PROJECT
// ============================================================================

export async function getProject(
  studioId: string,
  projectId: string,
): Promise<ProjectDto> {
  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      GET_FUNCTION,
      {
        method: "POST",
        headers,
        body: {
          project_id: projectId,
        },
      },
    );

    if (!error && data?.success === true && data?.data?.project) {
      return data.data.project as ProjectDto;
    }
  } catch (edgeErr) {
    console.warn("[getProject] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: dbProject, error: dbError } = await supabase
      .from("projects")
      .select("*, clients(id, display_name)")
      .eq("id", projectId)
      .eq("studio_id", studioId)
      .maybeSingle();

    if (!dbError && dbProject) {
      return dbProject as ProjectDto;
    }
  } catch (dbErr) {
    console.warn("[getProject] DB fallback error:", dbErr);
  }

  throw new Error("Project not found.");
}


// ============================================================================
// CREATE PROJECT
// ============================================================================

export async function createProject(
  studioId: string,
  payload: CreateProjectRequest,
): Promise<ProjectDto> {
  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      CREATE_FUNCTION,
      {
        method: "POST",
        headers,
        body: payload,
      },
    );

    if (!error && data?.success === true && data?.data) {
      return data.data as ProjectDto;
    }
  } catch (edgeErr) {
    console.warn("[createProject] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB insert fallback
  try {
    const randomPart = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Date.now().toString(36).toUpperCase();
    const projectCode = `PRJ_${randomPart}`;
    const { data: newProject, error: dbError } = await supabase
      .from("projects")
      .insert({
        studio_id: studioId,
        code: projectCode,
        title: payload.title,
        description: payload.description ?? null,
        client_id: payload.client_id ?? null,
        event_type: payload.event_type ?? "wedding",
        event_date: payload.event_date ?? null,
        delivery_deadline: payload.delivery_deadline ?? null,
        priority: payload.priority ?? "medium",
        status: payload.status ?? "draft",
        budget: payload.budget ?? null,
        advance_amount: payload.advance_amount ?? null,
        currency: payload.currency ?? "INR",
        notes: payload.notes ?? null,
        metadata: payload.metadata ?? {},
      })
      .select("*, clients(id, display_name)")
      .single();

    if (!dbError && newProject) {
      return newProject as ProjectDto;
    }
  } catch (dbErr) {
    console.warn("[createProject] DB fallback error:", dbErr);
  }

  throw new Error("Failed to create project.");
}


// ============================================================================
// UPDATE PROJECT
// ============================================================================

export async function updateProject(
  studioId: string,
  projectId: string,
  payload: UpdateProjectRequest,
): Promise<ProjectDto> {
  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      UPDATE_FUNCTION,
      {
        method: "POST",
        headers,
        body: {
          project_id: projectId,
          ...payload,
        },
      },
    );

    if (!error && data?.success === true && data?.data) {
      return data.data as ProjectDto;
    }
  } catch (edgeErr) {
    console.warn("[updateProject] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB update fallback
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.event_type !== undefined) updateData.event_type = payload.event_type;
    if (payload.event_date !== undefined) updateData.event_date = payload.event_date;
    if (payload.delivery_deadline !== undefined) updateData.delivery_deadline = payload.delivery_deadline;
    if (payload.priority !== undefined) updateData.priority = payload.priority;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.budget !== undefined) updateData.budget = payload.budget;
    if (payload.advance_amount !== undefined) updateData.advance_amount = payload.advance_amount;
    if (payload.currency !== undefined) updateData.currency = payload.currency;
    if (payload.notes !== undefined) updateData.notes = payload.notes;
    if (payload.metadata !== undefined) updateData.metadata = payload.metadata;

    const { data: updatedProject, error: dbError } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .eq("studio_id", studioId)
      .select("*, clients(id, display_name)")
      .single();

    if (!dbError && updatedProject) {
      return updatedProject as ProjectDto;
    }
  } catch (dbErr) {
    console.warn("[updateProject] DB fallback error:", dbErr);
  }

  throw new Error("Failed to update project.");
}
import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
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
    await getFirebaseIdToken();

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

  const offset =
    (page - 1) * limit;

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      LIST_FUNCTION,
      {
        method: "POST",

        headers:
          await getHeaders(
            studioId,
          ),

        body: {
          status: null,

          search:
            search.trim() || null,

          limit,

          offset,
        },
      },
    );


  if (error) {
    throw error;
  }


  if (!data) {
    throw new Error(
      "Projects returned an empty response.",
    );
  }


  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to load projects.",
    );
  }


  const workerData =
    data.data as ProjectListWorkerData;


  const total =
    Number(
      workerData?.total ?? 0,
    );


  const projects =
    Array.isArray(
      workerData?.projects,
    )
      ? workerData.projects
          .map(
            (item) =>
              item?.project,
          )
          .filter(
            (
              project,
            ): project is ProjectDto =>
              Boolean(
                project?.id,
              ),
          )
      : [];


  return {

    projects,

    pagination: {

      page,

      limit,

      total,

      totalPages:
        Math.max(
          1,
          Math.ceil(
            total / limit,
          ),
        ),

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

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      GET_FUNCTION,
      {
        method: "POST",

        headers:
          await getHeaders(
            studioId,
          ),

        body: {
          project_id:
            projectId,
        },
      },
    );

  if (error) {
    console.error(
      "PROJECT GET FUNCTION ERROR",
      error,
    );

    throw error;
  }

  console.log(
    "PROJECT GET RAW RESPONSE",
    JSON.stringify(data, null, 2),
  );

  if (!data) {
    throw new Error(
      "Project returned an empty response.",
    );
  }

  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to load project.",
    );
  }

  if (!data.data?.project) {
    console.error(
      "PROJECT GET INVALID DATA",
      data,
    );

    throw new Error(
      "Project response is missing project data.",
    );
  }

  console.log(
    "PROJECT GET PROJECT",
    data.data.project,
  );

  return data.data.project as ProjectDto;
}


// ============================================================================
// CREATE PROJECT
// ============================================================================

export async function createProject(
  studioId: string,
  payload: CreateProjectRequest,
): Promise<ProjectDto> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      CREATE_FUNCTION,
      {
        method: "POST",

        headers:
          await getHeaders(
            studioId,
          ),

        body: payload,
      },
    );


  if (error) {
    throw error;
  }


  if (!data) {
    throw new Error(
      "Project returned an empty response.",
    );
  }


  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to create project.",
    );
  }


  return data.data as ProjectDto;

}


// ============================================================================
// UPDATE PROJECT
// ============================================================================

export async function updateProject(
  studioId: string,
  projectId: string,
  payload: UpdateProjectRequest,
): Promise<ProjectDto> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      UPDATE_FUNCTION,
      {
        method: "POST",

        headers:
          await getHeaders(
            studioId,
          ),

        body: {

          project_id:
            projectId,

          title:
            payload.title ?? null,

          description:
            payload.description ?? null,

          event_type:
            payload.event_type ?? null,

          event_date:
            payload.event_date ?? null,

          delivery_deadline:
            payload.delivery_deadline ?? null,

          priority:
            payload.priority ?? null,

          status:
            payload.status ?? null,

          budget:
            payload.budget ?? null,

          advance_amount:
            payload.advance_amount ?? null,

          currency:
            payload.currency ?? null,

          notes:
            payload.notes ?? null,

          metadata:
            payload.metadata ?? null,

        },
      },
    );


  if (error) {
    throw error;
  }


  if (!data) {
    throw new Error(
      "Project returned an empty response.",
    );
  }


  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to update project.",
    );
  }


  return data.data as ProjectDto;

}
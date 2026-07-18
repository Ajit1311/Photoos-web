import { supabase } from "@/lib/supabase/client";
import type {
  ProjectDto,
  GetProjectsResponse,
  CreateProjectRequest,
} from "@/types/api/project";

const FUNCTION_NAME = "projects";

/**
 * Get all projects with pagination and search filtering
 */
export async function getProjects(
  studioId: string,
  page = 1,
  limit = 25,
  search = "",
): Promise<GetProjectsResponse> {

  const query =
    new URLSearchParams();

  query.set(
    "page",
    page.toString(),
  );

  query.set(
    "limit",
    limit.toString(),
  );

  if (search.trim()) {

    query.set(
      "search",
      search.trim(),
    );

  }

  const endpoint =
    `${FUNCTION_NAME}?${query.toString()}`;

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      endpoint,
      {
        method: "GET",

        headers: {
          "x-studio-id":
            studioId,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to load projects.",
    );

  }

  return data.data as GetProjectsResponse;

}

/**
 * Get a specific project by ID
 */
export async function getProject(
  studioId: string,
  projectId: string,
): Promise<ProjectDto> {
  const { data, error } = await supabase.functions.invoke(
    `${FUNCTION_NAME}/${projectId}`,
    {
      method: "GET",
      headers: {
        "x-studio-id": studioId,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to load project.",
    );

  }

  return data.data as ProjectDto;
}

/**
 * Create a new project
 */
export async function createProject(
  studioId: string,
  payload: CreateProjectRequest,
): Promise<ProjectDto> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    method: "POST",
    headers: {
      "x-studio-id": studioId,
    },
    body: payload,
  });

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to create project.",
    );

  }

  return data.data as ProjectDto;
}
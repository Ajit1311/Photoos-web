import {
  getProjects,
  getProject,
  createProject,
} from "@/lib/api/projects";

import type {
  GetProjectsResponse,
  ProjectDto,
  CreateProjectRequest,
} from "@/types/api/project";

class ProjectsRepository {

  async list(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<GetProjectsResponse> {

    return getProjects(
      studioId,
      page,
      limit,
      search,
    );

  }

  async get(
    studioId: string,
    projectId: string,
  ): Promise<ProjectDto> {

    return getProject(
      studioId,
      projectId,
    );

  }

  async create(
    studioId: string,
    payload: CreateProjectRequest,
  ): Promise<ProjectDto> {

    return createProject(
      studioId,
      payload,
    );

  }

}

export const projectsRepository =
  new ProjectsRepository();
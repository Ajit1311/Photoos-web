import {
  getProjects,
  getProject,
  createProject,
  updateProject,
} from "@/lib/api/projects";

import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  GetProjectsResponse,
  ProjectDto,
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

  async update(
    studioId: string,
    projectId: string,
    payload: UpdateProjectRequest,
  ): Promise<ProjectDto> {

    return updateProject(
      studioId,
      projectId,
      payload,
    );

  }

}

export const projectsRepository =
  new ProjectsRepository();
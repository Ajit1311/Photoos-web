export class WorkspaceService {
  async initialize(eventId: string) {
    console.log("Initializing Workspace", eventId);

    return {
      success: true,
    };
  }
}

export const workspaceService = new WorkspaceService();
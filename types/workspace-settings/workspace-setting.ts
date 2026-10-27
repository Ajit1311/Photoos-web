
export type WorkspaceSetting = {
  id:
    string;

  studio_id:
    string;

  category:
    string;

  key:
    string;

  value:
    Record<
      string,
      unknown
    >;

  description:
    string
    | null;

  is_active:
    boolean;

  created_at:
    string;

  updated_at:
    string;
};


export type WorkspaceSettingsResponse =
  WorkspaceSetting[];


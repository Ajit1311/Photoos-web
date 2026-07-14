export type BootstrapOrganization = {
  id: string;
  code: string;
  legal_name: string;
  display_name: string;
};

export type BootstrapStudio = {
  id: string;
  organization_id: string;
  name: string;

  organization?: BootstrapOrganization | null;
};

export type BootstrapRole = {
  id: string;
  code: string;
  name: string;
  level: number;
  status: string;
};

export type BootstrapMembership = {
  id: string;
  profileId: string;
  studioId: string;
  roleId: string;
  status: string;
};

export type BootstrapWorkspace = {
  organization: BootstrapOrganization | null;

  studio: BootstrapStudio | null;

  membership: BootstrapMembership;

  role: BootstrapRole | null;

  permissions: string[];

  flags: Record<string, boolean>;
};

export type BootstrapProfile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  status: string;
  created_at: string;
};

export type BootstrapUser = {
  id: string;
  email: string | null;
};

export type BootstrapResponse = {
  success: boolean;

  bootstrapRequired: boolean;

  user: BootstrapUser;

  profile: BootstrapProfile | null;

  workspace: BootstrapWorkspace;
};
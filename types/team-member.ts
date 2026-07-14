export type TeamMemberRole =
  | "owner"
  | "admin"
  | "manager"
  | "photographer"
  | "cinematographer"
  | "drone_operator"
  | "editor"
  | "designer"
  | "sales"
  | "assistant";

export type TeamMemberStatus =
  | "active"
  | "inactive";

export interface TeamMember {

  id: string;

  fullName: string;

  email: string | null;

  phone: string | null;

  avatarUrl: string | null;

  role: TeamMemberRole;

  status: TeamMemberStatus;

  createdAt: string;

  updatedAt: string;

}
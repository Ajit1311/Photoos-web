export type TeamMemberStatus =
  | "active"
  | "suspended";

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export type TeamMember = {
  id: string;

  studioId: string;

  profileId: string;

  email: string | null;

  employeeCode: string | null;

  roleId: string;

  roleCode: string;

  roleName: string;

  roleDescription: string | null;

  roleLevel: number;

  roleStatus: string | null;

  memberStatus: TeamMemberStatus;

  invitationStatus: InvitationStatus;

  joinedAt: string | null;

  createdAt: string;

  updatedAt: string;
};

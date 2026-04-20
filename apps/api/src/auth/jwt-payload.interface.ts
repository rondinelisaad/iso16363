import { UserOrganizationRole } from '@iso16363/shared-types';

export interface JwtPayload {
  sub: string;
  email: string;
  orgId: string | null;
  role: UserOrganizationRole | null;
  type: 'access';
}

export interface InvitePayload {
  email: string;
  orgId: string;
  role: UserOrganizationRole;
  type: 'invite';
}

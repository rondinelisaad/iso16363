import { SetMetadata } from '@nestjs/common';
import { UserOrganizationRole } from '@iso16363/shared-types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserOrganizationRole[]) => SetMetadata(ROLES_KEY, roles);

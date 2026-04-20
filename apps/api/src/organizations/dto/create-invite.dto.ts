import { IsEmail, IsEnum } from 'class-validator';
import { UserOrganizationRole } from '@iso16363/shared-types';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsEnum(UserOrganizationRole)
  role: UserOrganizationRole;
}

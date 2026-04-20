import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserOrganizationRole } from '@iso16363/shared-types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../auth/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserOrganizationRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;
    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    return !!user?.role && required.includes(user.role as UserOrganizationRole);
  }
}

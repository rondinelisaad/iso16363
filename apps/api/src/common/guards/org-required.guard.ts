import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../../auth/jwt-payload.interface';

@Injectable()
export class OrgRequiredGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{ user: JwtPayload }>().user;
    if (!user?.orgId) throw new ForbiddenException('Organization context required');
    return true;
  }
}

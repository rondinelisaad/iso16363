import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../auth/jwt-payload.interface';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const orgId = req.user?.orgId;
    if (orgId) {
      await this.prisma.$executeRaw`SELECT set_config('app.current_tenant', ${orgId}, TRUE)`;
    }
    return next.handle();
  }
}

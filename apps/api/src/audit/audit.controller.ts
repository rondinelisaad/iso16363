import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('audit')
@UseGuards(OrgRequiredGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get(':orgSlug')
  getDossier(@CurrentUser() user: JwtPayload, @Param('orgSlug') orgSlug: string) {
    return this.auditService.getDossier(user.orgId!, orgSlug);
  }

  @Get(':orgSlug/gap-analysis')
  getGapAnalysis(@CurrentUser() user: JwtPayload, @Param('orgSlug') orgSlug: string) {
    return this.auditService.getGapAnalysis(user.orgId!, orgSlug);
  }
}

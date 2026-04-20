import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { UpdateMetricStatusDto } from './dto/update-metric-status.dto';
import { UpdateAuditStatusDto } from './dto/update-audit-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { UserOrganizationRole } from '@iso16363/shared-types';

@Controller('metrics')
@UseGuards(OrgRequiredGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  // Static routes must be declared before :metricId to avoid shadowing
  @Get('summary')
  summary(@CurrentUser() user: JwtPayload) {
    return this.metricsService.getSummary(user.orgId!);
  }

  @Get('gap-analysis')
  gapAnalysis(@CurrentUser() user: JwtPayload) {
    return this.metricsService.getGapAnalysis(user.orgId!);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.metricsService.findAll(user.orgId!);
  }

  @Get(':metricId')
  findOne(@CurrentUser() user: JwtPayload, @Param('metricId') metricId: string) {
    return this.metricsService.findOne(user.orgId!, metricId);
  }

  @Patch(':metricId')
  @Roles(UserOrganizationRole.org_manager, UserOrganizationRole.contributor)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('metricId') metricId: string,
    @Body() dto: UpdateMetricStatusDto,
  ) {
    return this.metricsService.update(user.orgId!, metricId, user.sub, dto);
  }

  @Patch(':metricId/audit')
  @Roles(UserOrganizationRole.external_auditor)
  updateAudit(
    @CurrentUser() user: JwtPayload,
    @Param('metricId') metricId: string,
    @Body() dto: UpdateAuditStatusDto,
  ) {
    return this.metricsService.updateAudit(user.orgId!, metricId, user.sub, dto);
  }
}

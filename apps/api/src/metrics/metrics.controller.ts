import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { UpdateMetricStatusDto } from './dto/update-metric-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('metrics')
@UseGuards(OrgRequiredGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  // Must be declared before :metricId to avoid route shadowing
  @Get('summary')
  summary(@CurrentUser() user: JwtPayload) {
    return this.metricsService.getSummary(user.orgId!);
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
  update(
    @CurrentUser() user: JwtPayload,
    @Param('metricId') metricId: string,
    @Body() dto: UpdateMetricStatusDto,
  ) {
    return this.metricsService.update(user.orgId!, metricId, dto);
  }
}

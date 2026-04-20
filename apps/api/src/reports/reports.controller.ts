import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('reports')
@UseGuards(OrgRequiredGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':orgSlug/pdf')
  async generatePdf(
    @CurrentUser() user: JwtPayload,
    @Param('orgSlug') orgSlug: string,
    @Query('variant') variant: string,
    @Res() res: Response,
  ) {
    const safeVariant = variant === 'official' ? 'official' : 'draft';
    const buffer = await this.reportsService.generate(user.orgId!, orgSlug, safeVariant);
    const filename = `iso16363-${safeVariant}-${orgSlug}-${Date.now()}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}

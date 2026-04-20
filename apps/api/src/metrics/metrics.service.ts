import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMetricStatusDto } from './dto/update-metric-status.dto';

const SECTION_TOTALS: Record<string, number> = { '3': 28, '4': 50, '5': 23 };

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(orgId: string, metricId: string) {
    return this.prisma.metricStatus.findUnique({
      where: { organizationId_metricId: { organizationId: orgId, metricId } },
      include: { evidences: { orderBy: { uploadedAt: 'desc' } } },
    });
  }

  async update(orgId: string, metricId: string, dto: UpdateMetricStatusDto) {
    return this.prisma.metricStatus.upsert({
      where: { organizationId_metricId: { organizationId: orgId, metricId } },
      update: {
        ...(dto.readiness !== undefined && { readiness: dto.readiness }),
        ...(dto.justification !== undefined && { justification: dto.justification }),
      },
      create: {
        organizationId: orgId,
        metricId,
        readiness: dto.readiness ?? 'PENDING',
        justification: dto.justification ?? null,
      },
      include: { evidences: { orderBy: { uploadedAt: 'desc' } } },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.metricStatus.findMany({
      where: { organizationId: orgId },
      select: { metricId: true, readiness: true },
    });
  }

  async getSummary(orgId: string) {
    const statuses = await this.prisma.metricStatus.findMany({
      where: { organizationId: orgId },
      select: { metricId: true, readiness: true },
    });

    const sections: Record<string, { total: number; PENDING: number; IN_PROGRESS: number; READY: number }> = {};
    for (const [id, total] of Object.entries(SECTION_TOTALS)) {
      sections[id] = { total, PENDING: 0, IN_PROGRESS: 0, READY: 0 };
    }

    for (const s of statuses) {
      const sec = s.metricId.split('.')[0];
      if (sec in sections) sections[sec][s.readiness as keyof (typeof sections)[string]]++;
    }

    return sections;
  }
}

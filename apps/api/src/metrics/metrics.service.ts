import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMetricStatusDto } from './dto/update-metric-status.dto';
import { UpdateAuditStatusDto } from './dto/update-audit-status.dto';

const SECTION_TOTALS: Record<string, number> = { '3': 28, '4': 50, '5': 23 };
const NON_CONFORMANCE_TYPES = ['NON_COMPLIANT', 'PARTIAL', 'OBSERVATION'] as const;

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(orgId: string, metricId: string) {
    return this.prisma.metricStatus.findUnique({
      where: { organizationId_metricId: { organizationId: orgId, metricId } },
      include: { evidences: { orderBy: { uploadedAt: 'desc' } } },
    });
  }

  async update(orgId: string, metricId: string, userId: string, dto: UpdateMetricStatusDto) {
    const existing = await this.prisma.metricStatus.findUnique({
      where: { organizationId_metricId: { organizationId: orgId, metricId } },
      select: { readiness: true },
    });

    const result = await this.prisma.metricStatus.upsert({
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

    if (dto.readiness !== undefined && dto.readiness !== existing?.readiness) {
      await this.prisma.auditLog.create({
        data: {
          organizationId: orgId,
          metricId,
          userId,
          field: 'readiness',
          oldValue: existing?.readiness ?? null,
          newValue: dto.readiness,
        },
      });
    }

    return result;
  }

  async updateAudit(orgId: string, metricId: string, userId: string, dto: UpdateAuditStatusDto) {
    const existing = await this.prisma.metricStatus.findUnique({
      where: { organizationId_metricId: { organizationId: orgId, metricId } },
      select: { auditorOpinion: true },
    });

    const result = await this.prisma.metricStatus.upsert({
      where: { organizationId_metricId: { organizationId: orgId, metricId } },
      update: {
        auditorOpinion: dto.auditorOpinion,
        ...(dto.auditorComment !== undefined && { auditorComment: dto.auditorComment }),
      },
      create: {
        organizationId: orgId,
        metricId,
        readiness: 'PENDING',
        auditorOpinion: dto.auditorOpinion,
        auditorComment: dto.auditorComment ?? null,
      },
      include: { evidences: { orderBy: { uploadedAt: 'desc' } } },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        metricId,
        userId,
        field: 'auditorOpinion',
        oldValue: existing?.auditorOpinion ?? null,
        newValue: dto.auditorOpinion,
      },
    });

    if ((NON_CONFORMANCE_TYPES as readonly string[]).includes(dto.auditorOpinion)) {
      const managers = await this.prisma.userOrganization.findMany({
        where: { organizationId: orgId, role: 'org_manager' },
        select: { userId: true },
      });
      const metric = await this.prisma.isoSection.findUnique({
        where: { id: metricId },
        select: { code: true, title: true },
      });
      const label = dto.auditorOpinion.replace('_', ' ').toLowerCase();
      const message = `Auditor marked ${metric?.code ?? metricId} (${metric?.title ?? ''}) as ${label}`;
      await this.prisma.$transaction(
        managers.map((m) =>
          this.prisma.notification.create({
            data: { organizationId: orgId, recipientId: m.userId, type: dto.auditorOpinion, metricId, message },
          }),
        ),
      );
    }

    return result;
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

  async getGapAnalysis(orgId: string) {
    const statuses = await this.prisma.metricStatus.findMany({
      where: { organizationId: orgId, auditorOpinion: { not: null } },
      include: { metric: { select: { code: true, title: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const counts = { COMPLIANT: 0, NON_COMPLIANT: 0, PARTIAL: 0, OBSERVATION: 0 };
    for (const s of statuses) {
      if (s.auditorOpinion) counts[s.auditorOpinion]++;
    }

    return {
      total: 101,
      reviewed: statuses.length,
      ...counts,
      items: statuses.map((s) => ({
        metricId: s.metricId,
        code: s.metric.code,
        title: s.metric.title,
        readiness: s.readiness,
        auditorOpinion: s.auditorOpinion!,
        auditorComment: s.auditorComment,
      })),
    };
  }
}

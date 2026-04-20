import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getDossier(userOrgId: string, orgSlug: string) {
    const org = await this.prisma.organization.findFirst({
      where: { OR: [{ slug: orgSlug }, { id: orgSlug }] },
      select: { id: true, name: true, slug: true },
    });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.id !== userOrgId) throw new ForbiddenException('Access denied');

    const [sections, statuses] = await Promise.all([
      this.prisma.isoSection.findMany({
        where: { level: { in: [1, 2, 3] } },
        orderBy: { id: 'asc' },
      }),
      this.prisma.metricStatus.findMany({
        where: { organizationId: userOrgId },
        include: { evidences: { orderBy: { uploadedAt: 'desc' }, select: { id: true, fileName: true, uploadedAt: true } } },
      }),
    ]);

    const statusMap = new Map(statuses.map((s) => [s.metricId, s]));

    const topSections = sections.filter((s) => s.level === 1);
    return {
      org,
      sections: topSections.map((sec) => {
        const subs = sections.filter((s) => s.level === 2 && s.parentId === sec.id);
        return {
          id: sec.id,
          code: sec.code,
          title: sec.title,
          subsections: subs.map((sub) => {
            const metrics = sections.filter((s) => s.level === 3 && s.parentId === sub.id);
            return {
              id: sub.id,
              code: sub.code,
              title: sub.title,
              metrics: metrics.map((m) => {
                const st = statusMap.get(m.id);
                return {
                  metricId: m.id,
                  code: m.code,
                  title: m.title,
                  normText: m.normText,
                  readiness: st?.readiness ?? 'PENDING',
                  justification: st?.justification ?? null,
                  auditorOpinion: st?.auditorOpinion ?? null,
                  auditorComment: st?.auditorComment ?? null,
                  evidences: st?.evidences ?? [],
                };
              }),
            };
          }),
        };
      }),
    };
  }

  async getGapAnalysis(userOrgId: string, orgSlug: string) {
    const org = await this.prisma.organization.findFirst({
      where: { OR: [{ slug: orgSlug }, { id: orgSlug }] },
      select: { id: true },
    });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.id !== userOrgId) throw new ForbiddenException('Access denied');

    const statuses = await this.prisma.metricStatus.findMany({
      where: { organizationId: userOrgId, auditorOpinion: { not: null } },
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

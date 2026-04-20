import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { AuditService } from '../audit/audit.service';

type Variant = 'draft' | 'official';

const COLORS = {
  primary: '#1e3a5f',
  secondary: '#475569',
  muted: '#94a3b8',
  border: '#e2e8f0',
  draft: '#b45309',
  official: '#15803d',
  COMPLIANT: '#15803d',
  NON_COMPLIANT: '#dc2626',
  PARTIAL: '#c2410c',
  OBSERVATION: '#a16207',
  READY: '#15803d',
  IN_PROGRESS: '#b45309',
  PENDING: '#94a3b8',
} as const;

@Injectable()
export class ReportsService {
  constructor(private readonly auditService: AuditService) {}

  async generate(orgId: string, orgSlug: string, variant: Variant): Promise<Buffer> {
    const dossier = await this.auditService.getDossier(orgId, orgSlug);
    const { org, sections } = dossier as {
      org: { name: string; slug: string };
      sections: SectionData[];
    };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 56,
        info: {
          Title: `ISO 16363 Audit Report — ${org.name}`,
          Author: 'ISO 16363 Platform',
          Subject: 'CCSDS 652.0-M-2 Compliance',
        },
        autoFirstPage: true,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.renderCoverPage(doc, org.name, variant);
      this.renderSummary(doc, sections, variant);
      this.renderMetrics(doc, sections, variant);

      doc.end();
    });
  }

  private renderCoverPage(doc: PDFKit.PDFDocument, orgName: string, variant: Variant) {
    const w = doc.page.width - 112;

    doc.rect(56, 56, w, 4).fill(COLORS.primary);
    doc.moveDown(4);

    doc.fontSize(32).font('Helvetica-Bold').fillColor(COLORS.primary)
      .text('ISO 16363', { align: 'center' });
    doc.fontSize(20).font('Helvetica').fillColor(COLORS.secondary)
      .text('Compliance Audit Report', { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a')
      .text(orgName, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.muted)
      .text('Standard: CCSDS 652.0-M-2 — Trustworthy Digital Repositories', { align: 'center' });
    doc.moveDown(0.4);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      { align: 'center' },
    );

    doc.moveDown(2);
    const variantColor = variant === 'draft' ? COLORS.draft : COLORS.official;
    const variantLabel = variant === 'draft' ? 'DRAFT — FOR INTERNAL USE ONLY' : 'OFFICIAL AUDIT REPORT';
    doc.fontSize(14).font('Helvetica-Bold').fillColor(variantColor)
      .text(variantLabel, { align: 'center' });

    const botY = doc.page.height - 80;
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted)
      .text('ISO 16363 Compliance Platform · CCSDS 652.0-M-2', 56, botY, { align: 'center', width: w });
  }

  private renderSummary(
    doc: PDFKit.PDFDocument,
    sections: SectionData[],
    variant: Variant,
  ) {
    doc.addPage();
    this.sectionHeader(doc, 'Executive Summary');

    const allMetrics = sections.flatMap((s) =>
      s.subsections.flatMap((sub) => sub.metrics),
    );
    const total = allMetrics.length;
    const ready = allMetrics.filter((m) => m.readiness === 'READY').length;
    const inProg = allMetrics.filter((m) => m.readiness === 'IN_PROGRESS').length;
    const pending = total - ready - inProg;

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.primary).text('Readiness Progress');
    doc.moveDown(0.4);
    this.statRow(doc, 'Total metrics', String(total));
    this.statRow(doc, 'Ready', String(ready), COLORS.READY);
    this.statRow(doc, 'In Progress', String(inProg), COLORS.IN_PROGRESS);
    this.statRow(doc, 'Pending', String(pending), COLORS.PENDING);

    const pct = Math.round((ready / total) * 100);
    doc.moveDown(0.4);
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.secondary)
      .text(`Overall readiness: ${pct}% (${ready} of ${total} metrics marked READY)`);

    if (variant === 'official') {
      doc.moveDown(1.5);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.primary).text('Conformance Summary');
      doc.moveDown(0.4);

      const reviewed = allMetrics.filter((m) => m.auditorOpinion).length;
      const compliant = allMetrics.filter((m) => m.auditorOpinion === 'COMPLIANT').length;
      const nonCompliant = allMetrics.filter((m) => m.auditorOpinion === 'NON_COMPLIANT').length;
      const partial = allMetrics.filter((m) => m.auditorOpinion === 'PARTIAL').length;
      const observation = allMetrics.filter((m) => m.auditorOpinion === 'OBSERVATION').length;

      this.statRow(doc, 'Metrics reviewed', `${reviewed} / ${total}`);
      this.statRow(doc, 'Compliant', String(compliant), COLORS.COMPLIANT);
      this.statRow(doc, 'Non-Compliant', String(nonCompliant), COLORS.NON_COMPLIANT);
      this.statRow(doc, 'Partial', String(partial), COLORS.PARTIAL);
      this.statRow(doc, 'Observation', String(observation), COLORS.OBSERVATION);
    }
  }

  private renderMetrics(
    doc: PDFKit.PDFDocument,
    sections: SectionData[],
    variant: Variant,
  ) {
    for (const section of sections) {
      doc.addPage();
      this.sectionHeader(doc, `${section.code}  ${section.title}`);

      for (const sub of section.subsections) {
        doc.moveDown(0.8);
        doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primary)
          .text(`${sub.code}  ${sub.title}`);
        doc.moveDown(0.3);

        for (const metric of sub.metrics) {
          this.renderMetricRow(doc, metric, variant);
        }
      }
    }
  }

  private renderMetricRow(doc: PDFKit.PDFDocument, metric: MetricData, variant: Variant) {
    const pageBottom = doc.page.height - 80;
    if (doc.y > pageBottom - 60) doc.addPage();

    const readinessColor = COLORS[metric.readiness as keyof typeof COLORS] ?? COLORS.muted;

    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a')
      .text(`${metric.code}  ${metric.title}`, { continued: false });

    doc.fontSize(8).font('Helvetica').fillColor(readinessColor)
      .text(`  Readiness: ${metric.readiness}`);

    if (metric.justification) {
      const j = metric.justification.length > 200
        ? metric.justification.slice(0, 200) + '…'
        : metric.justification;
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.secondary).text(`  ${j}`);
    }

    if (metric.evidences?.length) {
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.muted)
        .text(`  Evidence: ${metric.evidences.length} file(s)`);
    }

    if (variant === 'official' && metric.auditorOpinion) {
      const opinionColor = COLORS[metric.auditorOpinion as keyof typeof COLORS] ?? COLORS.muted;
      doc.fontSize(8).font('Helvetica-Bold').fillColor(opinionColor)
        .text(`  Auditor Opinion: ${metric.auditorOpinion}`);
      if (metric.auditorComment) {
        const c = metric.auditorComment.length > 200
          ? metric.auditorComment.slice(0, 200) + '…'
          : metric.auditorComment;
        doc.fontSize(8).font('Helvetica').fillColor(COLORS.secondary).text(`  Comment: ${c}`);
      }
    }

    doc.moveTo(56, doc.y + 3)
      .lineTo(doc.page.width - 56, doc.y + 3)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.5);
  }

  private sectionHeader(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.primary).text(title);
    const y = doc.y + 4;
    doc.moveTo(56, y).lineTo(doc.page.width - 56, y)
      .strokeColor(COLORS.primary).lineWidth(1).stroke();
    doc.moveDown(0.6);
  }

  private statRow(doc: PDFKit.PDFDocument, label: string, value: string, color?: string) {
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.secondary).text(`  ${label}: `, { continued: true });
    doc.font('Helvetica-Bold').fillColor(color ?? '#0f172a').text(value);
  }
}

interface MetricData {
  metricId: string;
  code: string;
  title: string;
  readiness: string;
  justification: string | null;
  auditorOpinion: string | null;
  auditorComment: string | null;
  evidences: unknown[];
}

interface SectionData {
  id: string;
  code: string;
  title: string;
  subsections: { id: string; code: string; title: string; metrics: MetricData[] }[];
}

import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { RecordEvidenceDto } from './dto/record-evidence.dto';

@Injectable()
export class EvidenceService {
  private readonly s3: S3Client | null;
  private readonly bucket: string;
  private readonly ttl: number;

  constructor(private readonly prisma: PrismaService) {
    this.bucket = process.env.AWS_S3_BUCKET ?? '';
    this.ttl = parseInt(process.env.SIGNED_URL_TTL_SECONDS ?? '900', 10);

    const keyId = process.env.AWS_ACCESS_KEY_ID;
    const secret = process.env.AWS_SECRET_ACCESS_KEY;
    this.s3 =
      keyId && secret
        ? new S3Client({
            region: process.env.AWS_REGION ?? 'us-east-1',
            credentials: { accessKeyId: keyId, secretAccessKey: secret },
          })
        : null;
  }

  private requireS3(): S3Client {
    if (!this.s3) throw new ServiceUnavailableException('AWS S3 not configured');
    return this.s3;
  }

  async generateUploadUrl(orgId: string, dto: CreateUploadUrlDto) {
    const s3 = this.requireS3();
    const s3Key = `orgs/${orgId}/metrics/${dto.metricId}/${Date.now()}-${dto.fileName}`;
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: dto.contentType,
    });
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: this.ttl });
    return { uploadUrl, s3Key };
  }

  async record(orgId: string, userId: string, dto: RecordEvidenceDto) {
    const metricStatus = await this.prisma.metricStatus.upsert({
      where: { organizationId_metricId: { organizationId: orgId, metricId: dto.metricId } },
      update: {},
      create: { organizationId: orgId, metricId: dto.metricId, readiness: 'PENDING' },
    });
    return this.prisma.evidence.create({
      data: {
        organizationId: orgId,
        metricStatusId: metricStatus.id,
        s3Key: dto.s3Key,
        fileName: dto.fileName,
        uploadedBy: userId,
      },
    });
  }

  async generateViewUrl(orgId: string, evidenceId: string) {
    const s3 = this.requireS3();
    const evidence = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId: orgId },
    });
    if (!evidence) throw new NotFoundException('Evidence not found');
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: evidence.s3Key });
    const url = await getSignedUrl(s3, cmd, { expiresIn: this.ttl });
    return { url };
  }

  async remove(orgId: string, evidenceId: string) {
    const evidence = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId: orgId },
    });
    if (!evidence) throw new NotFoundException('Evidence not found');
    if (this.s3) {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: evidence.s3Key }));
    }
    await this.prisma.evidence.delete({ where: { id: evidenceId } });
    return { deleted: true };
  }
}

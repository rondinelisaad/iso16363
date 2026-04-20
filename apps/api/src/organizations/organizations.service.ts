import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserOrganization } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InvitePayload } from '../auth/jwt-payload.interface';
import { UserOrganizationRole } from '@iso16363/shared-types';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(userId: string, dto: CreateOrgDto) {
    const existing = await this.prisma.organization.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already taken');

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({ data: { name: dto.name, slug: dto.slug } });
      await tx.userOrganization.create({
        data: { userId, organizationId: org.id, role: UserOrganizationRole.org_manager },
      });
      return org;
    });
  }

  async findMyOrgs(userId: string) {
    return this.prisma.userOrganization.findMany({
      where: { userId },
      include: { organization: true },
    });
  }

  async createInvite(
    currentUserId: string,
    currentOrgId: string,
    slug: string,
    dto: CreateInviteDto,
    baseUrl: string,
  ): Promise<{ token: string; inviteUrl: string }> {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.id !== currentOrgId) throw new ForbiddenException('Not a member of this organization');

    const payload: InvitePayload = { email: dto.email, orgId: org.id, role: dto.role, type: 'invite' };
    const token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { token, inviteUrl: `${baseUrl}/accept-invite?token=${token}` };
  }

  async acceptInvite(userId: string, token: string): Promise<UserOrganization> {
    let payload: InvitePayload;
    try {
      payload = this.jwtService.verify<InvitePayload>(token);
    } catch {
      throw new BadRequestException('Invalid or expired invite token');
    }
    if (payload.type !== 'invite') throw new BadRequestException('Invalid token type');

    return this.prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId, organizationId: payload.orgId } },
      update: { role: payload.role },
      create: { userId, organizationId: payload.orgId, role: payload.role },
    });
  }

  async getBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      include: { users: { include: { user: { select: { id: true, email: true, name: true } } } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }
}

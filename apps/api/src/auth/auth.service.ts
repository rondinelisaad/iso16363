import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt-payload.interface';
import { UserOrganizationRole } from '@iso16363/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name ?? null, passwordHash: hash },
    });
    return { accessToken: this.sign(user.id, user.email, null, null) };
  }

  async login(userId: string, email: string): Promise<{ accessToken: string }> {
    const membership = await this.prisma.userOrganization.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return {
      accessToken: this.sign(
        userId,
        email,
        membership?.organizationId ?? null,
        (membership?.role as UserOrganizationRole) ?? null,
      ),
    };
  }

  issueToken(
    userId: string,
    email: string,
    orgId: string,
    role: UserOrganizationRole,
  ): { accessToken: string } {
    return { accessToken: this.sign(userId, email, orgId, role) };
  }

  private sign(
    userId: string,
    email: string,
    orgId: string | null,
    role: UserOrganizationRole | null,
  ): string {
    const payload: JwtPayload = { sub: userId, email, orgId, role, type: 'access' };
    return this.jwtService.sign(payload);
  }
}

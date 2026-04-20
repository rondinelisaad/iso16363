import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnread(userId: string, orgId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId, organizationId: orgId, read: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, orgId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId, organizationId: orgId },
      data: { read: true },
    });
    return { ok: true };
  }

  async markAllRead(userId: string, orgId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, organizationId: orgId, read: false },
      data: { read: true },
    });
    return { ok: true };
  }
}

import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('notifications')
@UseGuards(OrgRequiredGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findUnread(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.findUnread(user.sub, user.orgId!);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllRead(user.sub, user.orgId!);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markRead(user.sub, user.orgId!, id);
  }
}

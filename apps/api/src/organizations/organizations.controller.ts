import { Controller, Post, Get, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { UserOrganizationRole } from '@iso16363/shared-types';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrgDto) {
    return this.orgsService.create(user.sub, dto);
  }

  @Get('me')
  myOrgs(@CurrentUser() user: JwtPayload) {
    return this.orgsService.findMyOrgs(user.sub);
  }

  @Get(':slug')
  getOrg(@CurrentUser() user: JwtPayload, @Param('slug') slug: string) {
    return this.orgsService.getBySlug(slug);
  }

  @Post(':slug/invites')
  @Roles(UserOrganizationRole.org_manager)
  @HttpCode(HttpStatus.CREATED)
  createInvite(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
    @Body() dto: CreateInviteDto,
    @Req() req: Request,
  ) {
    const baseUrl = process.env.NEXTAUTH_URL ?? `${req.protocol}://${req.get('host')}`;
    return this.orgsService.createInvite(user.sub, user.orgId!, slug, dto, baseUrl);
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from './jwt-payload.interface';
import { UserOrganizationRole } from '@iso16363/shared-types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly orgsService: OrganizationsService,
  ) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard, ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request & { user: User }) {
    return this.authService.login(req.user.id, req.user.email);
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return { id: user.sub, email: user.email, orgId: user.orgId, role: user.role };
  }

  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  async acceptInvite(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AcceptInviteDto,
  ): Promise<{ accessToken: string }> {
    const membership = await this.orgsService.acceptInvite(user.sub, dto.token);
    return this.authService.issueToken(
      user.sub,
      user.email,
      membership.organizationId,
      membership.role as UserOrganizationRole,
    );
  }

  // Reissues JWT with latest org membership — call after creating an org
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@CurrentUser() user: JwtPayload) {
    return this.authService.login(user.sub, user.email);
  }

  // Validates DTO shape only (used by login form pre-validation)
  @Public()
  @Post('validate-login')
  @HttpCode(HttpStatus.OK)
  validateLogin(@Body() _dto: LoginDto) {
    return { ok: true };
  }
}

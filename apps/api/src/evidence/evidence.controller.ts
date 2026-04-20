import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { RecordEvidenceDto } from './dto/record-evidence.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('evidence')
@UseGuards(OrgRequiredGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post('upload-url')
  generateUploadUrl(@CurrentUser() user: JwtPayload, @Body() dto: CreateUploadUrlDto) {
    return this.evidenceService.generateUploadUrl(user.orgId!, dto);
  }

  @Post('record')
  record(@CurrentUser() user: JwtPayload, @Body() dto: RecordEvidenceDto) {
    return this.evidenceService.record(user.orgId!, user.sub, dto);
  }

  @Get(':id/view-url')
  getViewUrl(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.evidenceService.generateViewUrl(user.orgId!, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.evidenceService.remove(user.orgId!, id);
  }
}

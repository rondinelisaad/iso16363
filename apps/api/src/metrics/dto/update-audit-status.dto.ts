import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ConformanceStatus } from '@iso16363/shared-types';

export class UpdateAuditStatusDto {
  @IsEnum(ConformanceStatus)
  auditorOpinion!: ConformanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  auditorComment?: string;
}

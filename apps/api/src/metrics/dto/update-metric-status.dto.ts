import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReadinessStatus } from '@iso16363/shared-types';

export class UpdateMetricStatusDto {
  @IsOptional()
  @IsEnum(ReadinessStatus)
  readiness?: ReadinessStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  justification?: string;
}

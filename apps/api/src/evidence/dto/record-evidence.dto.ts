import { IsString, MaxLength } from 'class-validator';

export class RecordEvidenceDto {
  @IsString()
  metricId: string;

  @IsString()
  s3Key: string;

  @IsString()
  @MaxLength(255)
  fileName: string;
}

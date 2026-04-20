import { IsString, MaxLength } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  metricId: string;

  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  contentType: string;
}

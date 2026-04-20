import { Module } from '@nestjs/common';
import { IsoService } from './iso.service';
import { IsoController } from './iso.controller';

@Module({
  providers: [IsoService],
  controllers: [IsoController],
})
export class IsoModule {}

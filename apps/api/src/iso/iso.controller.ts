import { Controller, Get, Param } from '@nestjs/common';
import { IsoService } from './iso.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('iso')
export class IsoController {
  constructor(private readonly isoService: IsoService) {}

  @Get('tree')
  findTree() {
    return this.isoService.findTree();
  }

  @Get('metrics')
  findAllMetrics() {
    return this.isoService.findAllMetrics();
  }

  @Get('sections/:id')
  findById(@Param('id') id: string) {
    return this.isoService.findById(id);
  }
}

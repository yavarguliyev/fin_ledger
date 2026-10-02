import { Injectable } from '@nestjs/common';

import { PageViewDto } from './dtos/page-view.dto';
import { RecordPageViewUseCase } from './use-cases/commands/record-page-view.use-case';

@Injectable()
export class PageViewService {
  constructor (private readonly recordPageViewUseCase: RecordPageViewUseCase) {}

  record (dto: PageViewDto): void {
    return this.recordPageViewUseCase.execute(dto);
  }
}

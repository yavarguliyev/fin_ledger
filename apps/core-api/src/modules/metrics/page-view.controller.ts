import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS } from '@common/libs';

import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { PAGE_VIEW } from './constants/page-view.constant';
import { PageViewDto, PageViewSchema } from './dtos/page-view.dto';
import { PageViewService } from './page-view.service';

@ApiTags(SHARED_CONSTANTS.METRICS.key)
@Controller({ path: PAGE_VIEW.CONTROLLER_PATH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class PageViewController {
  constructor (private readonly pageViewService: PageViewService) {}

  @Post(PAGE_VIEW.ROUTE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  record (@Body({ schema: PageViewSchema }) dto: PageViewDto): void {
    return this.pageViewService.record(dto);
  }
}

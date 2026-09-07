import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS } from '@common/libs';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.METRICS.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.METRICS })
export class MetricsController {
  @Get()
  metrics (): string {
    return 'hello';
  }
}

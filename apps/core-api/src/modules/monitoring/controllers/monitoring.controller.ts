import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ENVIRONMENT_CONSTANTS } from '@common/libs';

import { AlertmanagerWebhookDto, AlertmanagerWebhookSchema } from '../dtos/input/alertmanager-webhook.dto';
import { MONITORING } from '../constants/monitoring.constant';
import { MonitoringService } from '../services/monitoring.service';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.METRICS.key)
@SkipThrottle()
@Controller({ path: MONITORING.CONTROLLER_PATH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class MonitoringController {
  constructor (private readonly monitoringService: MonitoringService) {}

  @Post(MONITORING.ALERTS_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  async receiveAlerts (
    @Headers(MONITORING.AUTHORIZATION_HEADER) authorization: string | undefined,
    @Body({ schema: AlertmanagerWebhookSchema }) dto: AlertmanagerWebhookDto
  ): Promise<void> {
    return this.monitoringService.receiveAlerts({ ...dto, ...(authorization && { authorization }) });
  }
}

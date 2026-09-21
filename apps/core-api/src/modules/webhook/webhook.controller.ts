import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RawBodyRequest } from '@common/libs';

import { WebhookService } from './webhook.service';
import { HandleWebhookRequestDto, HandleWebhookRequestSchema } from './dtos/request/handle-webhook-request.dto';
import { ProcessWebhookResponseDto } from './dtos/response/process-webhook-response.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.WEBHOOK.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.WEBHOOK, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class WebhookController {
  constructor (private readonly webhookService: WebhookService) {}

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook (
    @Req() req: RawBodyRequest,
    @ParamsQueryAndHeaders({ schema: HandleWebhookRequestSchema }) dto: HandleWebhookRequestDto
  ): Promise<ProcessWebhookResponseDto> {
    return this.webhookService.processWebhook({ ...dto, req });
  }
}

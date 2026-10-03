import { Injectable } from '@nestjs/common';

import { ProcessWebhookUseCase } from './use-cases/commands/process-webhook.use-case';
import { ReplayWebhookEventUseCase } from './use-cases/commands/replay-webhook-event.use-case';
import { HandleWebhookDto } from './dtos/input/handle-webhook.dto';
import { ProcessWebhookResponseDto } from './dtos/response/process-webhook-response.dto';
import { ReplayWebhookEventDto } from './dtos/step/replay-webhook-event.dto';

@Injectable()
export class WebhookService {
  constructor (
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
    private readonly replayWebhookEventUseCase: ReplayWebhookEventUseCase
  ) {}

  async processWebhook (dto: HandleWebhookDto): Promise<ProcessWebhookResponseDto> {
    return this.processWebhookUseCase.execute(dto);
  }

  async replayEvent (dto: ReplayWebhookEventDto): Promise<void> {
    return this.replayWebhookEventUseCase.execute(dto);
  }
}

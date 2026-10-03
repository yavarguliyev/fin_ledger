import { Injectable } from '@nestjs/common';

import { ApplyWebhookEventUseCase } from './apply-webhook-event.use-case';
import { ReplayWebhookEventDto } from '../../dtos/step/replay-webhook-event.dto';

@Injectable()
export class ReplayWebhookEventUseCase {
  constructor (private readonly applyWebhookEvent: ApplyWebhookEventUseCase) {}

  async execute ({ event }: ReplayWebhookEventDto): Promise<void> {
    const { eventId, provider, eventType, payload, signatureVerified } = event;
    await this.applyWebhookEvent.execute({ eventId, provider, eventType, payload, signatureVerified: signatureVerified ?? false });
  }
}

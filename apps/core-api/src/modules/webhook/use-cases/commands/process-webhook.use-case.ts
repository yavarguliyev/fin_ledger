import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentCapability, PaymentProvider, PaymentProviderRegistry } from '@common/libs';

import { ApplyWebhookEventUseCase } from './apply-webhook-event.use-case';
import { HandleWebhookDto } from '../../dtos/input/handle-webhook.dto';
import { ProcessWebhookResponseDto } from '../../dtos/response/process-webhook-response.dto';
import { WEBHOOK_ERRORS } from '../../constants/errors/webhook-errors.constant';

@Injectable()
export class ProcessWebhookUseCase {
  constructor (
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly applyWebhookEvent: ApplyWebhookEventUseCase
  ) {}

  async execute ({ req, provider: providerParam }: HandleWebhookDto): Promise<ProcessWebhookResponseDto> {
    const providerName = providerParam as PaymentProvider;

    if (!this.providerRegistry.has({ providerName })) {
      const available = this.providerRegistry.available().join(WEBHOOK_ERRORS.PROVIDER_SEPARATOR);
      throw new BadRequestException(`${WEBHOOK_ERRORS.UNSUPPORTED_PROVIDER}: ${providerParam}. ${WEBHOOK_ERRORS.AVAILABLE_PROVIDERS}: ${available}`);
    }

    const paymentProvider = this.providerRegistry.require({ providerName, capability: PaymentCapability.WEBHOOKS });
    const rawPayload = req.rawBody ?? JSON.stringify(req.body);
    const signature = paymentProvider.extractSignature({ headers: req.headers });
    const { eventId, provider, eventType, payload, signatureVerified } = await paymentProvider.constructWebhookEvent({ payload: rawPayload, signature });

    await this.applyWebhookEvent.execute({ eventId, provider, eventType, payload, signatureVerified });

    return { received: true, eventId };
  }
}

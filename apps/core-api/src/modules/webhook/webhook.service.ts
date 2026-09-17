import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentMethodStatus, PaymentProvider, PaymentProviderRegistry, PaymentStatus, WebhookStatus } from '@common/libs';

import { HandlePaymentMethodEventUseCase } from './use-cases/commands/handle-payment-method-event.use-case';
import { HandlePaymentChargeEventUseCase } from './use-cases/commands/handle-payment-charge-event.use-case';
import { HandleWebhookDto, ProcessWebhookResult } from './dtos/request/handle-webhook.dto';
import { WebhookEventRepository } from './repositories/webhook-event.repository';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  private readonly paymentMethodEvents: Record<string, PaymentMethodStatus>;
  private readonly paymentChargeEvents: Record<string, PaymentStatus>;

  constructor (
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly handlePaymentMethod: HandlePaymentMethodEventUseCase,
    private readonly handlePaymentCharge: HandlePaymentChargeEventUseCase
  ) {
    this.paymentMethodEvents = this.handlePaymentCharge.paymentMethodEvents;
    this.paymentChargeEvents = this.handlePaymentCharge.paymentChargeEvents;
  }

  async processWebhook (dto: HandleWebhookDto): Promise<ProcessWebhookResult> {
    const {
      req,
      query: { provider: providerParam, ...signatures }
    } = dto;

    const validProviders = Object.values(PaymentProvider) as string[];
    if (!validProviders.includes(providerParam)) throw new BadRequestException(`Unsupported payment provider: ${providerParam}`);

    const providerSignature = providerParam as PaymentProvider;

    const stripeSignature = signatures['stripe-signature'] || signatures.stripeSignature;
    const customSignature = signatures['x-custom-signature'] || signatures.customSignature || '';

    const signature = stripeSignature || customSignature;
    const rawPayload = req.rawBody ?? JSON.stringify(req.body);

    const paymentProvider = this.providerRegistry.get(providerSignature);
    const event = await paymentProvider.constructWebhookEvent(rawPayload, signature);

    const existing = await this.webhookEventRepository.findByProviderAndEventId(event.provider, event.eventId);
    if (existing) {
      this.logger.warn(`Duplicate webhook skipped: ${event.provider}:${event.eventId}`);
      return { received: true, eventId: event.eventId };
    }

    const { eventId, provider, eventType, payload } = event;

    await this.webhookEventRepository.recordEvent({ eventId, provider, eventType, payload, status: WebhookStatus.PROCESSED });
    await this.dispatch(provider, eventType, payload);

    return { received: true, eventId };
  }

  private async dispatch (provider: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const paymentMethodStatus = this.paymentMethodEvents[eventType];

    if (paymentMethodStatus) {
      await this.handlePaymentMethod.execute({ provider, payload, status: paymentMethodStatus });
      return;
    }

    const paymentStatus = this.paymentChargeEvents[eventType];

    if (paymentStatus) {
      await this.handlePaymentCharge.execute({ provider, payload, status: paymentStatus });
      return;
    }

    this.logger.log(`Unhandled webhook event type: ${eventType}`);
  }
}

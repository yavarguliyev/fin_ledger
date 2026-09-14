import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentMethodStatus, PaymentProvider, PaymentProviderRegistry, PaymentStatus } from '@common/libs';

import { HandlePaymentMethodEventUseCase } from './use-cases/commands/handle-payment-method-event.use-case';
import { HandlePaymentChargeEventUseCase } from './use-cases/commands/handle-payment-charge-event.use-case';
import { HandleWebhookDto, ProcessWebhookResult } from './dtos/request/handle-webhook.dto';
import { WebhookEventRepository } from './repositories/webhook-event.repository';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  private readonly paymentMethodEvents: Record<string, PaymentMethodStatus> = {
    'payment_method.attached': PaymentMethodStatus.VERIFIED,
    'payment_method.verified': PaymentMethodStatus.VERIFIED,
    'setup_intent.succeeded': PaymentMethodStatus.VERIFIED,
    'payment_method.rejected': PaymentMethodStatus.REJECTED,
    'setup_intent.failed': PaymentMethodStatus.REJECTED
  };

  private readonly paymentChargeEvents: Record<string, PaymentStatus> = {
    'payment_intent.succeeded': PaymentStatus.COMPLETED,
    'charge.succeeded': PaymentStatus.COMPLETED,
    'payment_intent.payment_failed': PaymentStatus.FAILED,
    'charge.failed': PaymentStatus.FAILED
  };

  constructor (
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly handlePaymentMethod: HandlePaymentMethodEventUseCase,
    private readonly handlePaymentCharge: HandlePaymentChargeEventUseCase
  ) {}

  async processWebhook (query: HandleWebhookDto): Promise<ProcessWebhookResult> {
    const {
      req,
      query: { providerParam, stripeSignature, customSignature }
    } = query;

    const validProviders = Object.values(PaymentProvider) as string[];
    if (!validProviders.includes(providerParam)) throw new BadRequestException(`Unsupported payment provider: ${providerParam}`);

    const provider = providerParam as PaymentProvider;
    const signature = stripeSignature || customSignature || '';
    const rawPayload = req.rawBody ?? JSON.stringify(req.body);

    const paymentProvider = this.providerRegistry.get(provider);
    const event = await paymentProvider.constructWebhookEvent(rawPayload, signature);

    const existing = await this.webhookEventRepository.findByProviderAndEventId(event.provider, event.eventId);
    if (existing) {
      this.logger.warn(`Duplicate webhook skipped: ${event.provider}:${event.eventId}`);
      return { received: true, eventId: event.eventId };
    }

    await this.webhookEventRepository.recordEvent({
      eventId: event.eventId,
      provider: event.provider,
      eventType: event.eventType,
      payload: event.payload,
      status: 'PROCESSED'
    });

    await this.dispatch(event.provider, event.eventType, event.payload);
    return { received: true, eventId: event.eventId };
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

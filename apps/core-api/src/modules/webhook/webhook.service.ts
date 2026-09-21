import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentCapability, PaymentMethodStatus, PaymentProvider, PaymentProviderRegistry, PaymentStatus, WebhookStatus } from '@common/libs';

import { HandlePaymentMethodEventUseCase } from './use-cases/commands/handle-payment-method-event.use-case';
import { HandlePaymentChargeEventUseCase } from './use-cases/commands/handle-payment-charge-event.use-case';
import { HandleWebhookDto } from './dtos/input/handle-webhook.dto';
import { ProcessWebhookResponseDto } from './dtos/response/process-webhook-response.dto';
import { DispatchWebhookEventDto } from './dtos/step/dispatch-webhook-event.dto';
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

  async processWebhook (dto: HandleWebhookDto): Promise<ProcessWebhookResponseDto> {
    const { req, provider: providerParam } = dto;

    const providerName = providerParam as PaymentProvider;

    if (!this.providerRegistry.has({ providerName })) {
      throw new BadRequestException(`Unsupported payment provider: ${providerParam}. Available: ${this.providerRegistry.available().join(', ')}`);
    }

    const paymentProvider = this.providerRegistry.require({ providerName: providerName, capability: PaymentCapability.WEBHOOKS });
    const rawPayload = req.rawBody ?? JSON.stringify(req.body);
    const signature = paymentProvider.extractSignature({ headers: req.headers });
    const event = await paymentProvider.constructWebhookEvent({ payload: rawPayload, signature });

    const existing = await this.webhookEventRepository.findByProviderAndEventId({ provider: event.provider, eventId: event.eventId });
    if (existing) {
      this.logger.warn(`Duplicate webhook skipped: ${event.provider}:${event.eventId}`);
      return { received: true, eventId: event.eventId };
    }

    const { eventId, provider, eventType, payload, signatureVerified } = event;

    await this.webhookEventRepository.recordEvent({
      eventId,
      provider,
      eventType,
      payload,
      signatureVerified,
      status: WebhookStatus.PROCESSED,
      processedAt: new Date().toISOString()
    });
    await this.dispatch({ provider, eventType, payload });

    return { received: true, eventId };
  }

  private async dispatch (dto: DispatchWebhookEventDto): Promise<void> {
    const { provider, eventType, payload } = dto;
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

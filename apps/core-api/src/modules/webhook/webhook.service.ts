import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PaymentCapability, PaymentMethodStatus, PaymentProvider, PaymentProviderRegistry, PaymentStatus, PostgresService, WebhookStatus } from '@common/libs';

import { HandlePaymentMethodEventUseCase } from './use-cases/commands/handle-payment-method-event.use-case';
import { HandlePaymentChargeEventUseCase } from './use-cases/commands/handle-payment-charge-event.use-case';
import { HandleWebhookDto } from './dtos/input/handle-webhook.dto';
import { ProcessWebhookResponseDto } from './dtos/response/process-webhook-response.dto';
import { DispatchWebhookEventDto } from './dtos/step/dispatch-webhook-event.dto';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { HandleClaimedEventDto } from './dtos/step/handle-claimed-event.dto';
import { WEBHOOK_HANDLED_STATUSES } from './constants/status/webhook-statuses.constant';
import { WEBHOOK_ERRORS } from './constants/errors/webhook-errors.constant';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  private readonly paymentMethodEvents: Record<string, PaymentMethodStatus>;
  private readonly paymentChargeEvents: Record<string, PaymentStatus>;

  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
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

    const { eventId, provider, eventType, payload, signatureVerified } = event;

    const claimed = await this.webhookEventRepository.claim({ eventId, provider, eventType, payload, signatureVerified });
    if (!claimed) throw new InternalServerErrorException(WEBHOOK_ERRORS.CLAIM_FAILED);

    await this.postgresService.getWriteConnection().transaction({ callback: async adapter => this.handleClaimed({ event: claimed, adapter }) });

    return { received: true, eventId };
  }

  private async handleClaimed ({ event, adapter }: HandleClaimedEventDto): Promise<void> {
    const locked = await this.webhookEventRepository.findByIdForUpdate({ id: event.id, adapter });

    if (!locked || WEBHOOK_HANDLED_STATUSES.includes(locked.status)) {
      this.logger.warn(`Duplicate webhook skipped: ${event.provider}:${event.eventId}`);
      return;
    }

    const handled = await this.dispatch({ provider: locked.provider, eventType: locked.eventType, payload: locked.payload, adapter });
    await this.webhookEventRepository.markHandled({ id: locked.id, status: handled ? WebhookStatus.PROCESSED : WebhookStatus.IGNORED, adapter });
  }

  private async dispatch (dto: DispatchWebhookEventDto): Promise<boolean> {
    const { provider, eventType, payload, adapter } = dto;
    const paymentMethodStatus = this.paymentMethodEvents[eventType];

    if (paymentMethodStatus) {
      await this.handlePaymentMethod.execute({ provider, payload, status: paymentMethodStatus, adapter });
      return true;
    }

    const paymentStatus = this.paymentChargeEvents[eventType];

    if (paymentStatus) {
      await this.handlePaymentCharge.execute({ provider, payload, status: paymentStatus, adapter });
      return true;
    }

    this.logger.log(`Unhandled webhook event type: ${eventType}`);
    return false;
  }
}

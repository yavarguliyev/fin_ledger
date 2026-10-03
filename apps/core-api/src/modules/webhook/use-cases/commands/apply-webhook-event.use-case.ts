import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PostgresService, WebhookStatus } from '@common/libs';

import { HandlePaymentMethodEventUseCase } from './handle-payment-method-event.use-case';
import { HandlePaymentChargeEventUseCase } from './handle-payment-charge-event.use-case';
import { WebhookEventRepository } from '../../repositories/webhook-event.repository';
import { ClaimWebhookEventDto } from '../../dtos/repository/claim-webhook-event.dto';
import { DispatchWebhookEventDto } from '../../dtos/step/dispatch-webhook-event.dto';
import { HandleClaimedEventDto } from '../../dtos/step/handle-claimed-event.dto';
import { WEBHOOK_HANDLED_STATUSES } from '../../constants/status/webhook-statuses.constant';
import { WEBHOOK_ERRORS } from '../../constants/errors/webhook-errors.constant';
import { WEBHOOK_LOGS } from '../../constants/logs/webhook-logs.constant';

@Injectable()
export class ApplyWebhookEventUseCase {
  private readonly logger = new Logger(ApplyWebhookEventUseCase.name);

  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly handlePaymentMethod: HandlePaymentMethodEventUseCase,
    private readonly handlePaymentCharge: HandlePaymentChargeEventUseCase
  ) {}

  async execute (dto: ClaimWebhookEventDto): Promise<void> {
    const claimed = await this.webhookEventRepository.claim(dto);
    if (!claimed) throw new InternalServerErrorException(WEBHOOK_ERRORS.CLAIM_FAILED);

    await this.postgresService.getWriteConnection().transaction({ callback: async adapter => this.handleClaimed({ event: claimed, adapter }) });
  }

  private async handleClaimed ({ event, adapter }: HandleClaimedEventDto): Promise<void> {
    const locked = await this.webhookEventRepository.findByIdForUpdate({ id: event.id, adapter });

    if (!locked || WEBHOOK_HANDLED_STATUSES.includes(locked.status)) {
      this.logger.warn(`${WEBHOOK_LOGS.DUPLICATE_SKIPPED}: ${event.provider}${WEBHOOK_LOGS.KEY_SEPARATOR}${event.eventId}`);
      return;
    }

    const handled = await this.dispatch({ provider: locked.provider, eventType: locked.eventType, payload: locked.payload, adapter });
    await this.webhookEventRepository.markHandled({ id: locked.id, status: handled ? WebhookStatus.PROCESSED : WebhookStatus.IGNORED, adapter });
  }

  private async dispatch ({ provider, eventType, payload, adapter }: DispatchWebhookEventDto): Promise<boolean> {
    const paymentMethodStatus = this.handlePaymentCharge.paymentMethodEvents[eventType];

    if (paymentMethodStatus) {
      await this.handlePaymentMethod.execute({ provider, payload, status: paymentMethodStatus, adapter });
      return true;
    }

    const paymentStatus = this.handlePaymentCharge.paymentChargeEvents[eventType];

    if (paymentStatus) {
      await this.handlePaymentCharge.execute({ provider, payload, status: paymentStatus, adapter });
      return true;
    }

    this.logger.log(`${WEBHOOK_LOGS.UNHANDLED_TYPE}: ${eventType}`);
    return false;
  }
}

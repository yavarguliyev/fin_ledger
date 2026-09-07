import { Inject, Injectable } from '@nestjs/common';
import { DomainEventType, formatAmount, NotificationType, RABBITMQ_SERVICE, RabbitmqService } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { NotificationService } from '../../notification.service';
import { WalletEventPayloadDto } from '../../../wallet/dtos/events/wallet-event-payload.dto';

@Injectable()
export class WalletCreditedConsumer extends NotificationBaseConsumer<WalletEventPayloadDto> {
  protected readonly title = 'Wallet Credited';
  protected readonly eventType = DomainEventType.WALLET_CREDITED;
  protected readonly notificationType = NotificationType.WALLET_CREDITED;

  constructor (
    @Inject(RABBITMQ_SERVICE)
    protected override readonly rabbitmqService: RabbitmqService,
    protected override readonly notificationService: NotificationService
  ) {
    super(rabbitmqService, notificationService, WalletCreditedConsumer.name);
  }

  protected getUserId (payload: WalletEventPayloadDto): string {
    return payload.userId ?? '';
  }

  protected getContent (payload: WalletEventPayloadDto): string {
    return `Your wallet was credited with ${formatAmount(payload.amountMinor, payload.currency)}.`;
  }
}

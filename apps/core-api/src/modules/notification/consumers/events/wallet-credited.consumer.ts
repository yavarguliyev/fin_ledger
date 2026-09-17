import { Injectable } from '@nestjs/common';
import { BaseHelper, DomainEventType, NotificationType } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { WalletEventPayloadDto } from '../../../wallet/dtos/events/wallet-event-payload.dto';

@Injectable()
export class WalletCreditedConsumer extends NotificationBaseConsumer<WalletEventPayloadDto> {
  protected readonly title = 'Wallet Credited';
  protected readonly eventType = DomainEventType.WALLET_CREDITED;
  protected readonly notificationType = NotificationType.WALLET_CREDITED;

  constructor () {
    super(WalletCreditedConsumer.name);
  }

  protected getUserId (payload: WalletEventPayloadDto): string {
    return payload.userId ?? '';
  }

  protected getContent ({ amountMinor, currency }: WalletEventPayloadDto): string {
    return `Your wallet was credited with ${BaseHelper.formatAmount({ amountMinor, currency })}.`;
  }
}

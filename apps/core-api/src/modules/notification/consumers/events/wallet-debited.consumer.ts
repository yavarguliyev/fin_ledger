import { Injectable } from '@nestjs/common';
import { BaseHelper, DomainEventType, NotificationType } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { WalletEventPayloadDto } from '../../../wallet/dtos/events/wallet-event-payload.dto';

@Injectable()
export class WalletDebitedConsumer extends NotificationBaseConsumer<WalletEventPayloadDto> {
  protected readonly title = 'Wallet Debited';
  protected readonly eventType = DomainEventType.WALLET_DEBITED;
  protected readonly notificationType = NotificationType.WALLET_DEBITED;

  constructor () {
    super(WalletDebitedConsumer.name);
  }

  protected getUserId (payload: WalletEventPayloadDto): string {
    return payload.userId ?? '';
  }

  protected getContent ({ amountMinor, currency }: WalletEventPayloadDto): string {
    return `Your wallet was debited of ${BaseHelper.formatAmount({ amountMinor, currency })}.`;
  }
}

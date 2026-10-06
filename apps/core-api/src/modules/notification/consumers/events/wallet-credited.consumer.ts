import { Injectable } from '@nestjs/common';
import { BaseHelper, DomainEventType, NotificationType, NotificationTitle } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { WalletEventPayloadDto } from '../../../wallet';

@Injectable()
export class WalletCreditedConsumer extends NotificationBaseConsumer<WalletEventPayloadDto> {
  protected readonly title = NotificationTitle.WALLET_CREDITED;
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

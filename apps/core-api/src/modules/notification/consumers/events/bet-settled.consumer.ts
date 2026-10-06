import { Injectable } from '@nestjs/common';
import { BaseHelper, DomainEventType, NotificationType, NotificationTitle } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { BetSettledPayloadDto, BET_STATUS } from '../../../bet';

@Injectable()
export class BetSettledConsumer extends NotificationBaseConsumer<BetSettledPayloadDto> {
  protected readonly title = NotificationTitle.BET_WON;
  protected readonly eventType = DomainEventType.BET_SETTLED;
  protected readonly notificationType = NotificationType.BET_WON;

  constructor () {
    super(BetSettledConsumer.name);
  }

  protected getUserId ({ userId, status }: BetSettledPayloadDto): string | undefined {
    return status === BET_STATUS.WON ? userId : undefined;
  }

  protected getContent ({ payoutMinor, currency, selection }: BetSettledPayloadDto): string {
    return `Congratulations! You won ${BaseHelper.formatAmount({ amountMinor: payoutMinor, currency })} on ${selection}.`;
  }
}

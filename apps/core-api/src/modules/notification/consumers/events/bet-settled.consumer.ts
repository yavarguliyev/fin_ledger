import { Injectable } from '@nestjs/common';
import { BaseHelper, BetStatus, DomainEventType, NotificationType } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { BetSettledPayloadDto } from '../../../bet/dtos/event/bet-settled-payload.dto';

@Injectable()
export class BetSettledConsumer extends NotificationBaseConsumer<BetSettledPayloadDto> {
  protected readonly title = 'Bet Won';
  protected readonly eventType = DomainEventType.BET_SETTLED;
  protected readonly notificationType = NotificationType.BET_WON;

  constructor () {
    super(BetSettledConsumer.name);
  }

  protected getUserId ({ userId, status }: BetSettledPayloadDto): string | undefined {
    return status === BetStatus.WON ? userId : undefined;
  }

  protected getContent ({ payoutMinor, currency, selection }: BetSettledPayloadDto): string {
    return `Congratulations! You won ${BaseHelper.formatAmount({ amountMinor: payoutMinor, currency })} on ${selection}.`;
  }
}

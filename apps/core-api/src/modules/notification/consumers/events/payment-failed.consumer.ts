import { Injectable } from '@nestjs/common';
import { BaseHelper, DomainEventType, NotificationType } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { PaymentEventPayloadDto } from '../../dtos/event/payment-event-payload.dto';

@Injectable()
export class PaymentFailedConsumer extends NotificationBaseConsumer<PaymentEventPayloadDto> {
  protected readonly title = 'Payment Failed';
  protected readonly eventType = DomainEventType.PAYMENT_FAILED;
  protected readonly notificationType = NotificationType.PAYMENT_FAILED;

  constructor () {
    super(PaymentFailedConsumer.name);
  }

  protected getUserId (payload: PaymentEventPayloadDto): string {
    return payload.userId;
  }

  protected getContent ({ amountMinor, currency, failureReason }: PaymentEventPayloadDto): string {
    return `Your payment of ${BaseHelper.formatAmount({ amountMinor, currency })} failed: ${failureReason || 'Declined'}`;
  }
}

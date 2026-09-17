import { Injectable } from '@nestjs/common';
import { BaseHelper, DomainEventType, NotificationType } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { PaymentEventPayloadDto } from '../../dtos/payment/payment-event-payload.dto';

@Injectable()
export class PaymentCompletedConsumer extends NotificationBaseConsumer<PaymentEventPayloadDto> {
  protected readonly title = 'Payment Completed';
  protected readonly eventType = DomainEventType.PAYMENT_COMPLETED;
  protected readonly notificationType = NotificationType.PAYMENT_COMPLETED;

  constructor () {
    super(PaymentCompletedConsumer.name);
  }

  protected getUserId (payload: PaymentEventPayloadDto): string {
    return payload.userId;
  }

  protected getContent ({ amountMinor, currency }: PaymentEventPayloadDto): string {
    return `Your payment of ${BaseHelper.formatAmount({ amountMinor, currency })} was completed successfully.`;
  }
}

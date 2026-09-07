import { Inject, Injectable } from '@nestjs/common';
import { DomainEventType, formatAmount, NotificationType, RABBITMQ_SERVICE, RabbitmqService } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { NotificationService } from '../../notification.service';
import { PaymentEventPayloadDto } from '../../dtos/payment/payment-event-payload.dto';

@Injectable()
export class PaymentCompletedConsumer extends NotificationBaseConsumer<PaymentEventPayloadDto> {
  protected readonly title = 'Payment Completed';
  protected readonly eventType = DomainEventType.PAYMENT_COMPLETED;
  protected readonly notificationType = NotificationType.PAYMENT_COMPLETED;

  constructor (
    @Inject(RABBITMQ_SERVICE)
    protected override readonly rabbitmqService: RabbitmqService,
    protected override readonly notificationService: NotificationService
  ) {
    super(rabbitmqService, notificationService, PaymentCompletedConsumer.name);
  }

  protected getUserId (payload: PaymentEventPayloadDto): string {
    return payload.userId;
  }

  protected getContent ({ amountMinor, currency }: PaymentEventPayloadDto): string {
    return `Your payment of ${formatAmount(amountMinor, currency)} was completed successfully.`;
  }
}

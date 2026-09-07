import { Injectable } from '@nestjs/common';
import { KafkaSubscribe, KafkaMessageRecord, AnalyticsEventTopic, NotificationType, AggregateType, ActionEvent } from '@common/libs';

import { AnalyticsBaseHandler } from '../base/analytics-base-handler.use-case';
import { PaymentAnalyticsEventDto } from '../../dtos/payment-analytics-event.dto';

@Injectable()
export class PaymentCompletedHandler extends AnalyticsBaseHandler<PaymentAnalyticsEventDto> {
  protected readonly eventType = NotificationType.PAYMENT_COMPLETED;
  protected readonly aggregateType: AggregateType = 'User';
  protected readonly action: ActionEvent = 'completed';

  constructor () {
    super(PaymentCompletedHandler.name);
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.PAYMENT_COMPLETED })
  override handle (message: KafkaMessageRecord<PaymentAnalyticsEventDto>): void {
    super.handle(message);
  }
}

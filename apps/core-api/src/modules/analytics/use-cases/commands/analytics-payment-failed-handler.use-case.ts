import { Injectable } from '@nestjs/common';
import { KafkaSubscribe, KafkaMessageRecord, AnalyticsEventTopic, NotificationType, AggregateType, ActionEvent } from '@common/libs';

import { AnalyticsBaseHandler } from '../base/analytics-base-handler.use-case';
import { PaymentAnalyticsEventDto } from '../../dtos/payment-analytics-event.dto';

@Injectable()
export class PaymentFailedHandler extends AnalyticsBaseHandler<PaymentAnalyticsEventDto> {
  protected readonly eventType = NotificationType.PAYMENT_FAILED;
  protected readonly aggregateType: AggregateType = 'User';
  protected readonly action: ActionEvent = 'failed';

  constructor () {
    super(PaymentFailedHandler.name);
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.PAYMENT_FAILED })
  override handle (message: KafkaMessageRecord<PaymentAnalyticsEventDto>): void {
    super.handle(message);
  }
}

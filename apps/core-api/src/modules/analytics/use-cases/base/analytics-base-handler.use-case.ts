import { Injectable, Logger } from '@nestjs/common';
import { AggregateType, NotificationType, KafkaMessageRecord, ActionEvent } from '@common/libs';

import { BaseAnalyticsEventDto } from '../../dtos/base-analytics-event.dto';

@Injectable()
export abstract class AnalyticsBaseHandler<T extends BaseAnalyticsEventDto> {
  protected abstract readonly eventType: NotificationType;
  protected abstract readonly action: ActionEvent;
  protected abstract readonly aggregateType: AggregateType;
  protected readonly logger: Logger;

  constructor (loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  protected handle ({ value }: KafkaMessageRecord<T>): void {
    this.logger.log(`[Analytics] ${this.eventType}: ${JSON.stringify(value)}`);

    const { userId, walletId, amountMinor, currency, paymentType, failureReason, transactionId, timestamp } = value;

    const id = userId ?? walletId;
    const formattedAmount = `${amountMinor / 100} ${currency}`;
    const payment = paymentType ? ` ${paymentType} of` : '';
    const reason = failureReason ? ` - Reason: ${failureReason}` : '';
    const transaction = transactionId ? ` (Tx: ${transactionId})` : '';
    const message = `${this.aggregateType} ${id} ${this.action}${payment} ${formattedAmount}${reason}${transaction} at ${timestamp}`;

    this.logger.log(`[Analytics] ${this.eventType}: ${message}`);
  }
}

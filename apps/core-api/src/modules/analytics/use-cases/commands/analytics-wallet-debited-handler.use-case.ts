import { Injectable } from '@nestjs/common';
import { KafkaSubscribe, KafkaMessageRecord, AnalyticsEventTopic, NotificationType, AggregateType, ActionEvent } from '@common/libs';

import { AnalyticsBaseHandler } from '../base/analytics-base-handler.use-case';
import { WalletAnalyticsEventDto } from '../../dtos/wallet-analytics-event.dto';

@Injectable()
export class WalletDebitedHandler extends AnalyticsBaseHandler<WalletAnalyticsEventDto> {
  protected readonly eventType = NotificationType.WALLET_DEBITED;
  protected readonly aggregateType: AggregateType = 'Wallet';
  protected readonly action: ActionEvent = 'debited';

  constructor () {
    super(WalletDebitedHandler.name);
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.WALLET_DEBITED })
  override handle (message: KafkaMessageRecord<WalletAnalyticsEventDto>): void {
    super.handle(message);
  }
}

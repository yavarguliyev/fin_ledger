import { Injectable } from '@nestjs/common';
import { KafkaSubscribe, KafkaMessageRecord, NotificationType, AnalyticsEventTopic, AggregateType, ActionEvent } from '@common/libs';

import { AnalyticsBaseHandler } from '../base/analytics-base-handler.use-case';
import { WalletAnalyticsEventDto } from '../../dtos/wallet-analytics-event.dto';

@Injectable()
export class WalletCreditedHandler extends AnalyticsBaseHandler<WalletAnalyticsEventDto> {
  protected readonly eventType = NotificationType.WALLET_CREDITED;
  protected readonly action: ActionEvent = 'credited';
  protected readonly aggregateType: AggregateType = 'Wallet';

  constructor () {
    super(WalletCreditedHandler.name);
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.WALLET_CREDITED })
  override handle (message: KafkaMessageRecord<WalletAnalyticsEventDto>): void {
    super.handle(message);
  }
}

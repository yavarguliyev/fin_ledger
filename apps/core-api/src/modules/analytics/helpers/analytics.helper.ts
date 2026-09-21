import { DomainEventType } from '@common/libs';

import { EmitPaymentAnalyticsDto } from '../dtos/helper/emit-payment-analytics.dto';
import { EmitWalletAnalyticsDto } from '../dtos/helper/emit-wallet-analytics.dto';

export class AnalyticsHelper {
  static async emitKafkaPaymentAnalytics (event: EmitPaymentAnalyticsDto): Promise<void> {
    const { isCompleted, publishPaymentCompleted, publishPaymentFailed, ...payload } = event;
    if (isCompleted) await publishPaymentCompleted(payload);
    else await publishPaymentFailed(payload);
  }

  static async emitKafkaWalletAnalytics (event: EmitWalletAnalyticsDto): Promise<void> {
    const { eventType, publishWalletCredited, publishWalletDebited, ...payload } = event;

    if (eventType === DomainEventType.WALLET_CREDITED) {
      await publishWalletCredited(payload);
      return;
    }

    await publishWalletDebited(payload);
  }
}

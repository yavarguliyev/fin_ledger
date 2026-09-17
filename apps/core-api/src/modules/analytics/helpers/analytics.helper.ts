import { DomainEventType } from '@common/libs';

import { PaymentAnalyticsEventDto, WalletAnalyticsEventDto } from '../dtos/analytics-helper.dto';

export class AnalyticsHelper {
  public static async emitKafkaPaymentAnalytics (event: PaymentAnalyticsEventDto): Promise<void> {
    const { isCompleted, publishPaymentCompleted, publishPaymentFailed, ...payload } = event;
    if (isCompleted) await publishPaymentCompleted(payload);
    else await publishPaymentFailed(payload);
  }

  public static async emitKafkaWalletAnalytics (event: WalletAnalyticsEventDto): Promise<void> {
    const { eventType, publishWalletCredited, publishWalletDebited, ...payload } = event;

    if (eventType === DomainEventType.WALLET_CREDITED) {
      await publishWalletCredited(payload);
      return;
    }

    await publishWalletDebited(payload);
  }
}

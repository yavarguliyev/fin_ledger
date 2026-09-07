import { DomainEventType } from '@common/libs';

import { WalletAnalyticsEventDto } from '../../dtos/analytics-event.dto';

export const emitKafkaWalletAnalytics = async (event: WalletAnalyticsEventDto): Promise<void> => {
  const { eventType, publishWalletCredited, publishWalletDebited, ...payload } = event;

  if (eventType === DomainEventType.WALLET_CREDITED) {
    await publishWalletCredited(payload);
    return;
  }

  await publishWalletDebited(payload);
};

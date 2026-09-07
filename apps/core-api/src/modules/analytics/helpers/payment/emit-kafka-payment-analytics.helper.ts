import { PaymentAnalyticsEventDto } from '../../dtos/analytics-event.dto';

export const emitKafkaPaymentAnalytics = async (event: PaymentAnalyticsEventDto): Promise<void> => {
  const { isCompleted, publishPaymentCompleted, publishPaymentFailed, ...payload } = event;
  if (isCompleted) await publishPaymentCompleted(payload);
  else await publishPaymentFailed(payload);
};

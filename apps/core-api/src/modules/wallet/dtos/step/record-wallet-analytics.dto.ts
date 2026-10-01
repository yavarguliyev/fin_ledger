import { z } from 'zod';
import { AnalyticsEventTopic } from '@common/libs';

import { PublishWalletAnalyticsSchema } from './publish-wallet-analytics.dto';

export const RecordWalletAnalyticsSchema = PublishWalletAnalyticsSchema.extend({
  eventType: z.enum(AnalyticsEventTopic, { message: 'Event type must be a valid AnalyticsEventTopic enum' })
});

export type RecordWalletAnalyticsDto = z.infer<typeof RecordWalletAnalyticsSchema>;

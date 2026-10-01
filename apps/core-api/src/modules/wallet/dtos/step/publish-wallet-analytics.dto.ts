import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { AnalyticsEventPayloadDto } from '../../../analytics/dtos/payload/analytics-event-payload.dto';

export const PublishWalletAnalyticsSchema = z.object({
  eventPayload: z.custom<AnalyticsEventPayloadDto>(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type PublishWalletAnalyticsDto = z.infer<typeof PublishWalletAnalyticsSchema>;

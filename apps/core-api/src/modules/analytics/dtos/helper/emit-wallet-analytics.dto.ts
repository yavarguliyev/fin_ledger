import { z } from 'zod';
import { DomainEventType } from '@common/libs';

import { AnalyticsEventPayloadDto, AnalyticsEventPayloadSchema } from '../payload/analytics-event-payload.dto';

export const EmitWalletAnalyticsSchema = AnalyticsEventPayloadSchema.extend({
  eventType: z.enum(DomainEventType, { message: 'Event type must be a valid domain event type' }),

  publishWalletCredited: z.custom<(payload: AnalyticsEventPayloadDto) => Promise<AnalyticsEventPayloadDto>>(),

  publishWalletDebited: z.custom<(payload: AnalyticsEventPayloadDto) => Promise<AnalyticsEventPayloadDto>>()
});

export type EmitWalletAnalyticsDto = z.infer<typeof EmitWalletAnalyticsSchema>;

import type { MessageAttributeValue } from '@aws-sdk/client-sqs';
import { z } from 'zod';

export const MessageAttributesSchema = z.object({
  attributes: z.custom<Record<string, MessageAttributeValue>>().optional()
});

export type MessageAttributesDto = z.infer<typeof MessageAttributesSchema>;

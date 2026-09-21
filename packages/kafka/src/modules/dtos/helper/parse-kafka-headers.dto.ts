import { z } from 'zod';

import type { IHeaders } from 'kafkajs';

export const ParseKafkaHeadersSchema = z.object({
  headers: z.custom<IHeaders>()
});

export type ParseKafkaHeadersDto = z.infer<typeof ParseKafkaHeadersSchema>;

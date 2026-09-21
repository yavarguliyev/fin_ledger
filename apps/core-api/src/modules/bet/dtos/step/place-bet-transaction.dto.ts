import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { PlaceBetSchema } from '../input/place-bet.dto';

export const PlaceBetTransactionSchema = PlaceBetSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type PlaceBetTransactionDto = z.infer<typeof PlaceBetTransactionSchema>;

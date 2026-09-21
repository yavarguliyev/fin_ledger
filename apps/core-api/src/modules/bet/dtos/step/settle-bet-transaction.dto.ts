import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { SettleBetSchema } from '../request/settle-bet.dto';

export const SettleBetTransactionSchema = SettleBetSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type SettleBetTransactionDto = z.infer<typeof SettleBetTransactionSchema>;

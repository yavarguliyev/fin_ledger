import { z } from 'zod';

import { OpenWalletRequestSchema } from '../request/open-wallet-request.dto';

export const OpenWalletSchema = OpenWalletRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type OpenWalletDto = z.infer<typeof OpenWalletSchema>;

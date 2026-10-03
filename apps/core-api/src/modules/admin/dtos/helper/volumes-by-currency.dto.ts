import { z } from 'zod';

import { UserWithWalletSchema } from '../../../user/dtos/user/user-with-wallet.dto';

export const VolumesByCurrencySchema = z.object({
  users: z.array(UserWithWalletSchema)
});

export type VolumesByCurrencyDto = z.infer<typeof VolumesByCurrencySchema>;

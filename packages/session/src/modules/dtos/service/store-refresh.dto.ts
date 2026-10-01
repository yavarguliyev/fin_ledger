import { z } from 'zod';

import { RefreshRecord } from '../../interfaces/refresh-record.interface';

export const StoreRefreshSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token must be a string' }).min(1, { message: 'Refresh token is required' }),

  record: z.custom<RefreshRecord>()
});

export type StoreRefreshDto = z.infer<typeof StoreRefreshSchema>;

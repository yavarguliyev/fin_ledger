import { z } from 'zod';

import { CacheProvider } from '../../interfaces/cache-provider.interface';

export const RegisterCacheProviderSchema = z.object({ provider: z.custom<CacheProvider>() });

export type RegisterCacheProviderDto = z.infer<typeof RegisterCacheProviderSchema>;

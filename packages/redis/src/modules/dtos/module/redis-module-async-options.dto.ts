import { z } from 'zod';
import type { InjectionToken } from '@nestjs/common';
import { ClientIds } from '@common/shared-libs';

import type { RedisCacheConfig } from '../../interfaces/redis-cache-config.interface';

export const RedisModuleAsyncOptionsSchema = z.object({
  useFactory: z.custom<(...args: unknown[]) => RedisCacheConfig | Promise<RedisCacheConfig>>(),

  inject: z.custom<InjectionToken[]>().optional(),

  clientId: z.enum(ClientIds).optional()
});

export type RedisModuleAsyncOptionsDto = z.infer<typeof RedisModuleAsyncOptionsSchema>;

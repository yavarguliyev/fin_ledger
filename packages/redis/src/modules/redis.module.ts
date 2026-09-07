import { DynamicModule, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { RedisCacheProvider } from './services/redis-cache-provider.class';
import { RedisModuleAsyncOptions } from './interfaces/redis.interface';

@Module({})
export class RedisModule implements OnModuleDestroy {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly provider: RedisCacheProvider) {}

  static registerAsync (options: RedisModuleAsyncOptions): DynamicModule {
    const cacheProvider = {
      provide: REDIS_CACHE_PROVIDER,
      useFactory: async (...args: unknown[]): Promise<RedisCacheProvider> => {
        const config = await options.useFactory(...args);
        if (options.clientId) {
          return new RedisCacheProvider({ ...config, clientId: options.clientId });
        }
        return new RedisCacheProvider(config);
      },
      inject: options.inject ?? []
    };

    return {
      module: RedisModule,
      providers: [cacheProvider],
      exports: [REDIS_CACHE_PROVIDER]
    };
  }

  static forRoot (clientId?: ClientIds): DynamicModule {
    const cacheProvider = {
      provide: REDIS_CACHE_PROVIDER,
      useFactory: async (configService: ConfigService): Promise<RedisCacheProvider> => {
        const password = configService.get<string>('REDIS_PASSWORD');
        const db = configService.get<number>('REDIS_DB', 0);

        const config = {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          ...(password && { password }),
          ...(db !== undefined && { db })
        };

        if (clientId) {
          return new RedisCacheProvider({ ...config, clientId });
        }

        await Promise.resolve();
        return new RedisCacheProvider(config);
      },
      inject: [ConfigService]
    };

    return {
      module: RedisModule,
      providers: [cacheProvider],
      exports: [REDIS_CACHE_PROVIDER]
    };
  }

  async onModuleDestroy (): Promise<void> {
    await this.provider.disconnect();
  }
}

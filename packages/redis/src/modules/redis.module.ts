import { DynamicModule, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIdDto, REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { RedisCacheProvider } from './services/redis-cache-provider.class';
import { RedisModuleAsyncOptionsDto } from './dtos/module/redis-module-async-options.dto';
import { REDIS_DEFAULTS } from './constants/connection/redis-defaults.constant';

@Module({})
export class RedisModule implements OnModuleDestroy {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly provider: RedisCacheProvider) {}

  static registerAsync (options: RedisModuleAsyncOptionsDto): DynamicModule {
    const cacheProvider = {
      provide: REDIS_CACHE_PROVIDER,
      useFactory: async (...args: unknown[]): Promise<RedisCacheProvider> => {
        const config = await options.useFactory(...args);
        if (options.clientId) {
          return new RedisCacheProvider({ config: { ...config, clientId: options.clientId } });
        }
        return new RedisCacheProvider({ config });
      },
      inject: options.inject ?? []
    };

    return {
      module: RedisModule,
      providers: [cacheProvider],
      exports: [REDIS_CACHE_PROVIDER]
    };
  }

  static forRoot ({ clientId }: ClientIdDto = {}): DynamicModule {
    const cacheProvider = {
      provide: REDIS_CACHE_PROVIDER,
      useFactory: async (configService: ConfigService): Promise<RedisCacheProvider> => {
        const password = configService.get<string>('REDIS_PASSWORD');
        const db = configService.get<number>('REDIS_DB', REDIS_DEFAULTS.DB);

        const config = {
          host: configService.get<string>('REDIS_HOST', REDIS_DEFAULTS.HOST),
          port: configService.get<number>('REDIS_PORT', REDIS_DEFAULTS.PORT),
          ...(password && { password }),
          ...(db !== undefined && { db })
        };

        if (clientId) {
          return new RedisCacheProvider({ config: { ...config, clientId } });
        }

        await Promise.resolve();
        return new RedisCacheProvider({ config });
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

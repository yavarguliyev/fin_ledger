import Redis from 'ioredis';

import { RedisSentinelConfig } from '../interfaces/redis-sentinel-config.interface';
import { RedisConfigRefDto } from '../dtos/provider/redis-config-ref.dto';
import { REDIS_DEFAULTS } from '../constants/connection/redis-defaults.constant';

export class RedisClientHelper {
  static create ({ config }: RedisConfigRefDto): Redis {
    if ('sentinels' in config) {
      const sentinel = config as RedisSentinelConfig;

      return new Redis({
        sentinels: [...sentinel.sentinels],
        name: sentinel.name ?? REDIS_DEFAULTS.SENTINEL_MASTER_NAME,
        ...(sentinel.password != null && { password: sentinel.password }),
        ...(sentinel.db != null && { db: sentinel.db })
      });
    }

    return new Redis({
      host: config.host,
      port: config.port,
      ...(config.password != null && { password: config.password }),
      ...(config.db != null && { db: config.db })
    });
  }
}

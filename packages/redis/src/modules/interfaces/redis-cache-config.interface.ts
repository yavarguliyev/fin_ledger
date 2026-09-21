import { ClientIds } from '@common/shared-libs';

export interface RedisCacheConfig {
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly db?: number;
  readonly clientId?: ClientIds;
}

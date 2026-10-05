import Redis from 'ioredis';

export interface PresenceSeedDto {
  redis: Redis;
  userIds: string[];
  displayName: string;
}

export interface PresenceClearDto {
  redis: Redis;
  userIds: string[];
}

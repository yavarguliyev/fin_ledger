import { Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { CallIdRefDto } from '../dtos/call/call-id-ref.dto';
import { CallRefDto } from '../dtos/call/call-ref.dto';
import { StoredCallDto } from '../dtos/call/stored-call.dto';
import { SUPPORT_CALL } from '../constants/call/support-call.constant';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class SupportCallRepository {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly cache: CacheProvider) {}

  async find ({ callId }: CallIdRefDto): Promise<StoredCallDto | null> {
    return this.cache.get<StoredCallDto>({ key: `${SUPPORT_CALL.KEY_PREFIX}${callId}` });
  }

  async activeFor ({ userId }: UserRefDto): Promise<string | null> {
    const callId = await this.cache.get<string>({ key: `${SUPPORT_CALL.USER_KEY_PREFIX}${userId}` });
    if (!callId) return null;

    return (await this.find({ callId })) ? callId : null;
  }

  async save ({ call }: CallRefDto): Promise<void> {
    const ttlSeconds = SUPPORT_CALL.TTL_SECONDS;

    await this.cache.set({ key: `${SUPPORT_CALL.KEY_PREFIX}${call.callId}`, value: call, ttlSeconds });
    await this.cache.set({ key: `${SUPPORT_CALL.USER_KEY_PREFIX}${call.callerId}`, value: call.callId, ttlSeconds });
    await this.cache.set({ key: `${SUPPORT_CALL.USER_KEY_PREFIX}${call.calleeId}`, value: call.callId, ttlSeconds });
  }

  async remove ({ call }: CallRefDto): Promise<void> {
    await this.cache.delete({ key: `${SUPPORT_CALL.KEY_PREFIX}${call.callId}` });
    await this.cache.delete({ key: `${SUPPORT_CALL.USER_KEY_PREFIX}${call.callerId}` });
    await this.cache.delete({ key: `${SUPPORT_CALL.USER_KEY_PREFIX}${call.calleeId}` });
  }
}

import { Injectable } from '@nestjs/common';
import { CacheDelete, CacheRead, CacheWrite } from '@common/libs';

import { CallIdRefDto } from '../dtos/call/call-id-ref.dto';
import { CallKeyHelper } from '../helpers/call-key.helper';
import { CallRefDto } from '../dtos/call/call-ref.dto';
import { StoredCallDto } from '../dtos/call/stored-call.dto';
import { SUPPORT_CALL } from '../constants/call/support-call.constant';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class CallSessionService {
  @CacheRead({ key: (ref: CallIdRefDto) => CallKeyHelper.callKey(ref) })
  async find (_ref: CallIdRefDto): Promise<StoredCallDto | null> {
    return Promise.resolve(null);
  }

  @CacheRead({ key: (ref: UserRefDto) => CallKeyHelper.userKey(ref) })
  async activeCallId (_ref: UserRefDto): Promise<string | null> {
    return Promise.resolve(null);
  }

  @CacheWrite({ key: ({ call }: CallRefDto) => CallKeyHelper.callKey(call), ttlSeconds: SUPPORT_CALL.TTL_SECONDS })
  @CacheWrite({
    key: ({ call }: CallRefDto) => CallKeyHelper.userKey({ userId: call.callerId }),
    ttlSeconds: SUPPORT_CALL.TTL_SECONDS,
    value: (call: StoredCallDto) => call.callId
  })
  @CacheWrite({
    key: ({ call }: CallRefDto) => CallKeyHelper.userKey({ userId: call.calleeId }),
    ttlSeconds: SUPPORT_CALL.TTL_SECONDS,
    value: (call: StoredCallDto) => call.callId
  })
  async save ({ call }: CallRefDto): Promise<StoredCallDto> {
    return Promise.resolve(call);
  }

  @CacheDelete({
    keys: ({ call }: CallRefDto) => [
      CallKeyHelper.callKey(call),
      CallKeyHelper.userKey({ userId: call.callerId }),
      CallKeyHelper.userKey({ userId: call.calleeId })
    ]
  })
  async remove (_ref: CallRefDto): Promise<void> {
    return Promise.resolve();
  }
}

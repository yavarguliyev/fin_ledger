import { Throttle } from '@nestjs/throttler';

import { RATE_LIMITS } from '../constants/rate-limit/rate-limits.constant';

export const ChatRateLimit = (): MethodDecorator & ClassDecorator => {
  return Throttle({ [RATE_LIMITS.USER.NAME]: { limit: RATE_LIMITS.USER.CHAT_LIMIT } });
};

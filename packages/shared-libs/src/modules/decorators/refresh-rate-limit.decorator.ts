import { Throttle } from '@nestjs/throttler';

import { RateLimitHelper } from '../helpers/rate-limit.helper';
import { RATE_LIMITS } from '../constants/rate-limit/rate-limits.constant';

export const RefreshRateLimit = (): MethodDecorator & ClassDecorator => {
  return Throttle({
    [RATE_LIMITS.CLIENT.NAME]: { limit: RATE_LIMITS.CLIENT.REFRESH_LIMIT, getTracker: request => RateLimitHelper.sessionTracker({ request }) }
  });
};

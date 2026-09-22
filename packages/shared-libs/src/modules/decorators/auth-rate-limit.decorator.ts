import { Throttle } from '@nestjs/throttler';

import { RATE_LIMITS } from '../constants/rate-limit/rate-limits.constant';

export const AuthRateLimit = (): MethodDecorator & ClassDecorator =>
  Throttle({ [RATE_LIMITS.CLIENT.NAME]: { limit: RATE_LIMITS.CLIENT.AUTH_LIMIT } });

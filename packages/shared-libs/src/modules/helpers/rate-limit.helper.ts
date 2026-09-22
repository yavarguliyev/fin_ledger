import { ThrottlerModuleOptions } from '@nestjs/throttler';

import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { RATE_LIMITS } from '../constants/rate-limit/rate-limits.constant';
import { RateLimitContextDto } from '../dtos/rate-limit/rate-limit-context.dto';
import { RateLimitOptionsDto } from '../dtos/rate-limit/rate-limit-options.dto';
import { RateLimitRequestDto } from '../dtos/rate-limit/rate-limit-request.dto';

export class RateLimitHelper {
  static options ({ storage }: RateLimitOptionsDto): ThrottlerModuleOptions {
    const { TTL_MS, CLIENT, USER } = RATE_LIMITS;

    return {
      storage,
      throttlers: [
        {
          name: CLIENT.NAME,
          ttl: TTL_MS,
          limit: CLIENT.LIMIT,
          skipIf: (context) => RateLimitHelper.isAuthenticated({ context }),
          getTracker: (request) => RateLimitHelper.clientTracker({ request })
        },
        {
          name: USER.NAME,
          ttl: TTL_MS,
          limit: USER.LIMIT,
          skipIf: (context) => !RateLimitHelper.isAuthenticated({ context }),
          getTracker: (request) => RateLimitHelper.userTracker({ request })
        }
      ]
    };
  }

  static isAuthenticated ({ context }: RateLimitContextDto): boolean {
    return Boolean(context.switchToHttp().getRequest<Partial<AuthenticatedRequest>>().user);
  }

  static clientTracker ({ request }: RateLimitRequestDto): string {
    const { SEPARATOR, UNKNOWN_CLIENT } = RATE_LIMITS.TRACKER;
    const ip = request.ip ?? UNKNOWN_CLIENT;
    const body: unknown = request.body;
    const email = typeof body === 'object' && body !== null && 'email' in body ? body.email : undefined;

    return typeof email === 'string' ? `${ip}${SEPARATOR}${email.trim().toLowerCase()}` : ip;
  }

  static userTracker ({ request }: RateLimitRequestDto): string {
    return request.user?.userId ?? RATE_LIMITS.TRACKER.ANONYMOUS_USER;
  }
}

import { ThrottlerModuleOptions } from '@nestjs/throttler';

import { CryptoHelper } from './crypto.helper';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { RATE_LIMITS } from '../constants/rate-limit/rate-limits.constant';
import { RateLimitContextDto } from '../dtos/rate-limit/rate-limit-context.dto';
import { RateLimitOptionsDto } from '../dtos/rate-limit/rate-limit-options.dto';
import { RateLimitRequestDto } from '../dtos/rate-limit/rate-limit-request.dto';

export class RateLimitHelper {
  static userTracker = ({ request }: RateLimitRequestDto): string => request.user?.userId ?? RATE_LIMITS.TRACKER.ANONYMOUS_USER;

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

  static sessionTracker ({ request }: RateLimitRequestDto): string {
    const { SEPARATOR, UNKNOWN_CLIENT, NO_SESSION, SESSION_FIELD } = RATE_LIMITS.TRACKER;
    const body: unknown = request.body;
    const token = typeof body === 'object' && body !== null && SESSION_FIELD in body ? body[SESSION_FIELD as keyof typeof body] : undefined;
    const session = request.headers?.cookie ?? (typeof token === 'string' ? token : NO_SESSION);

    return `${request.ip ?? UNKNOWN_CLIENT}${SEPARATOR}${CryptoHelper.sha256({ value: session })}`;
  }

  static options ({ storage }: RateLimitOptionsDto): ThrottlerModuleOptions {
    const { TTL_MS, CLIENT, USER } = RATE_LIMITS;

    return {
      storage,
      throttlers: [
        {
          name: CLIENT.NAME,
          ttl: TTL_MS,
          limit: CLIENT.LIMIT,
          skipIf: context => RateLimitHelper.isAuthenticated({ context }),
          getTracker: request => RateLimitHelper.clientTracker({ request })
        },
        {
          name: USER.NAME,
          ttl: TTL_MS,
          limit: USER.LIMIT,
          skipIf: context => !RateLimitHelper.isAuthenticated({ context }),
          getTracker: request => RateLimitHelper.userTracker({ request })
        }
      ]
    };
  }
}

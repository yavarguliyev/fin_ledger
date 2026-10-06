import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { RateLimitedOptionsDto } from '../dtos/decorator/rate-limited-options.dto';

export const RateLimited = ({ key, limit, windowMs, error }: RateLimitedOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({
    step: async ({ provider, run }) => {
      const { totalHits } = await provider.hitRateLimit({ key, ttlMs: windowMs, limit, blockDurationMs: windowMs });
      if (totalHits > limit) throw error();
      return run();
    }
  });

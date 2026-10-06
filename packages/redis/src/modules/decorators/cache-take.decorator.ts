import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { CacheKeyOptionsDto } from '../dtos/decorator/cache-key-options.dto';

export const CacheTake = ({ key }: CacheKeyOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({
    step: async ({ provider, input, run }) => {
      const cacheKey = key(input as never);
      const stored = await provider.get({ key: cacheKey });
      if (stored === null) return run();
      await provider.delete({ key: cacheKey });
      return stored;
    }
  });

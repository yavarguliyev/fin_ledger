import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { CacheKeysOptionsDto } from '../dtos/decorator/cache-keys-options.dto';

export const CacheDelete = ({ keys }: CacheKeysOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({
    step: async ({ provider, input, run }) => {
      const result = await run();
      for (const cacheKey of keys(input as never, result as never)) await provider.delete({ key: cacheKey });
      return result;
    }
  });

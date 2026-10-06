import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { CacheWriteOptionsDto } from '../dtos/decorator/cache-write-options.dto';

export const CacheWrite = ({ key, ttlSeconds, value }: CacheWriteOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({
    step: async ({ provider, input, run }) => {
      const result = await run();
      await provider.set({ key: key(input as never, result as never), value: value ? value(result as never) : result, ...(ttlSeconds && { ttlSeconds }) });
      return result;
    }
  });

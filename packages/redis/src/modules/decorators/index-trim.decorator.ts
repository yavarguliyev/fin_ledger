import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { IndexRangesOptionsDto } from '../dtos/decorator/index-ranges-options.dto';

export const IndexTrim = ({ ranges }: IndexRangesOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({
    step: async ({ provider, input, run }) => {
      const result = await run();
      await Promise.all(ranges(input as never).map(range => provider.trimSortedSet(range)));
      return result;
    }
  });

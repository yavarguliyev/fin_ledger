import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { IndexRangeOptionsDto } from '../dtos/decorator/index-range-options.dto';

export const IndexRange = ({ range }: IndexRangeOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({ step: ({ provider, input }) => provider.rangeSortedSet(range(input as never)) });

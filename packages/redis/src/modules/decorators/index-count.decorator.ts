import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { IndexCountOptionsDto } from '../dtos/decorator/index-count-options.dto';

export const IndexCount = ({ index }: IndexCountOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({ step: ({ provider, input }) => provider.countSortedSet(index(input as never)) });

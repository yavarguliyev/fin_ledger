import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { IndexLatestOptionsDto } from '../dtos/decorator/index-latest-options.dto';

export const IndexLatest = ({ index }: IndexLatestOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({ step: ({ provider, input }) => provider.latestInSortedSet(index(input as never)) });

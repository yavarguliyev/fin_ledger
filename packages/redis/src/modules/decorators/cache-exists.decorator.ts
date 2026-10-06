import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { CacheKeyOptionsDto } from '../dtos/decorator/cache-key-options.dto';

export const CacheExists = ({ key }: CacheKeyOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({ step: async ({ provider, input }) => provider.exists({ key: key(input as never) }) });

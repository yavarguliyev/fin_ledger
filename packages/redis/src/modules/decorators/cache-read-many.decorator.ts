import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { CacheKeysOptionsDto } from '../dtos/decorator/cache-keys-options.dto';

export const CacheReadMany = ({ keys }: CacheKeysOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({ step: ({ provider, input }) => provider.getMany({ keys: keys(input as never, undefined as never) }) });

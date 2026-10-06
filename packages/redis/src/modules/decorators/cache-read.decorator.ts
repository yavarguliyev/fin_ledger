import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { CacheKeyOptionsDto } from '../dtos/decorator/cache-key-options.dto';

export const CacheRead = ({ key }: CacheKeyOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({ step: async ({ provider, input, run }) => (await provider.get({ key: key(input as never) })) ?? run() });

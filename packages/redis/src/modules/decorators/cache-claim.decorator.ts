import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { CacheClaimOptionsDto } from '../dtos/decorator/cache-claim-options.dto';

export const CacheClaim = ({ key, value, ttlSeconds }: CacheClaimOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({ step: ({ provider }) => provider.setIfNotExists({ key, value, ttlSeconds }) });

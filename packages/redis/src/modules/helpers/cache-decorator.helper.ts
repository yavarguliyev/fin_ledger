import { AsyncMethod, UnknownRecord } from '@common/shared-libs';

import { CacheDecoratorDto } from '../dtos/helper/cache-decorator.dto';
import { CacheHelper } from './cache.helper';

export class CacheDecoratorHelper {
  static create ({ step }: CacheDecoratorDto): MethodDecorator {
    return (_target: object, _propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
      const original = descriptor.value as AsyncMethod;

      descriptor.value = async function (this: UnknownRecord, ...args: unknown[]): Promise<unknown> {
        const run = (): Promise<unknown> => original.apply(this, args);
        const provider = CacheHelper.resolveProvider({ target: this });
        return provider ? step({ provider, input: args[0], run }) : run();
      };
    };
  }
}

import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { IndexEntriesOptionsDto } from '../dtos/decorator/index-entries-options.dto';

export const IndexAdd = ({ entries }: IndexEntriesOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({
    step: async ({ provider, input, run }) => {
      const result = await run();
      await Promise.all(entries(input as never, result as never).map(entry => provider.addToSortedSet(entry)));
      return result;
    }
  });

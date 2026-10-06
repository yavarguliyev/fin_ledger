import { CacheDecoratorHelper } from '../helpers/cache-decorator.helper';
import { IndexMembersOptionsDto } from '../dtos/decorator/index-members-options.dto';

export const IndexRemove = ({ members }: IndexMembersOptionsDto): MethodDecorator =>
  CacheDecoratorHelper.create({
    step: async ({ provider, input, run }) => {
      const result = await run();
      await Promise.all(members(input as never, result as never).map(member => provider.removeFromSortedSet(member)));
      return result;
    }
  });

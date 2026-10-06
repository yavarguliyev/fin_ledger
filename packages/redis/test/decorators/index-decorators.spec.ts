import { IndexAdd } from '../../src/modules/decorators/index-add.decorator';
import { IndexCount } from '../../src/modules/decorators/index-count.decorator';
import { IndexLatest } from '../../src/modules/decorators/index-latest.decorator';
import { IndexRange } from '../../src/modules/decorators/index-range.decorator';
import { IndexRemove } from '../../src/modules/decorators/index-remove.decorator';
import { IndexTrim } from '../../src/modules/decorators/index-trim.decorator';
import { DECORATORS_TEST as T } from '../constants/decorators.constant';
import { MemoryCacheFake, withCache } from '../fakes/memory-cache.fake';
import { Scored } from '../interfaces/decorators.interface';

class Board {
  @IndexAdd({ entries: ({ id, score }: Scored) => [{ key: T.INDEX, member: id, score }] })
  async add (_entry: Scored): Promise<void> {
    return Promise.resolve();
  }

  @IndexRemove({ members: ({ id }: Scored) => [{ key: T.INDEX, member: id }] })
  async remove (_entry: Scored): Promise<void> {
    return Promise.resolve();
  }

  @IndexLatest({ index: () => ({ key: T.INDEX, min: T.CUTOFF, limit: T.LIMIT }) })
  async latest (): Promise<string[]> {
    return Promise.resolve([]);
  }

  @IndexCount({ index: () => ({ key: T.INDEX, min: T.CUTOFF }) })
  async count (): Promise<number> {
    return Promise.resolve(0);
  }

  @IndexRange({ range: () => ({ key: T.INDEX, max: T.CUTOFF }) })
  async stale (): Promise<string[]> {
    return Promise.resolve([]);
  }

  @IndexTrim({ ranges: () => [{ key: T.INDEX, max: T.CUTOFF }] })
  async trim (): Promise<void> {
    return Promise.resolve();
  }
}

describe('Sorted-set index decorators', () => {
  let board: Board;

  beforeEach(async () => {
    board = withCache(new Board(), new MemoryCacheFake());
    await board.add({ id: T.ID, score: T.NEW_SCORE });
    await board.add({ id: T.OTHER, score: T.OLD_SCORE });
  });

  it('reads the latest members, counts them and finds the stale ones', async () => {
    expect(await board.latest()).toEqual([T.ID]);
    expect(await board.count()).toBe(1);
    expect(await board.stale()).toEqual([T.OTHER]);
  });

  it('trims stale members and removes a member', async () => {
    await board.trim();
    expect(await board.stale()).toEqual([]);

    await board.remove({ id: T.ID, score: T.NEW_SCORE });
    expect(await board.count()).toBe(0);
  });
});

import { ReactionHelper } from '../../../src/app/core/helpers/support/reaction.helper';
import { REACTION_TEST as T } from '../../constants/reaction.constant';

const reactions = [
  { emoji: T.THUMBS, userId: T.PEER },
  { emoji: T.THUMBS, userId: T.ME },
  { emoji: T.HEART, userId: T.PEER }
];

describe('ReactionHelper', () => {
  it('groups reactions by emoji in first-seen order and marks mine', () => {
    expect(ReactionHelper.summarize({ reactions, myUserId: T.ME })).toEqual([
      { emoji: T.THUMBS, count: 2, mine: true },
      { emoji: T.HEART, count: 1, mine: false }
    ]);
  });

  it('removes my reaction when I pick the same emoji again, otherwise switches to the new one', () => {
    expect(ReactionHelper.next({ reactions, myUserId: T.ME, emoji: T.THUMBS })).toBeNull();
    expect(ReactionHelper.next({ reactions, myUserId: T.ME, emoji: T.HEART })).toBe(T.HEART);
  });
});

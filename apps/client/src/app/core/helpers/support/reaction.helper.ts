import { ReactionPickDto } from '../../interfaces/support/reaction-pick.interface';
import { ReactionSummary } from '../../interfaces/support/reaction-summary.interface';
import { ReactionsOfDto } from '../../interfaces/support/reactions-of.interface';

export class ReactionHelper {
  static summarize ({ reactions, myUserId }: ReactionsOfDto): ReactionSummary[] {
    const groups = new Map<string, ReactionSummary>();
    for (const reaction of reactions) {
      const current = groups.get(reaction.emoji) ?? { emoji: reaction.emoji, count: 0, mine: false };
      groups.set(reaction.emoji, { ...current, count: current.count + 1, mine: current.mine || reaction.userId === myUserId });
    }
    return [...groups.values()];
  }

  static next ({ reactions, myUserId, emoji }: ReactionPickDto): string | null {
    const mine = reactions.find(reaction => reaction.userId === myUserId);
    return mine?.emoji === emoji ? null : emoji;
  }
}

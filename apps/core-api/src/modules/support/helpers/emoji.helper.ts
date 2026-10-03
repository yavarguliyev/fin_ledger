import { EmojiValueDto } from '../dtos/input/emoji-value.dto';
import { MESSAGE_REACTION } from '../constants/chat/message-reaction.constant';

export class EmojiHelper {
  private static readonly segmenter = new Intl.Segmenter(undefined, { granularity: MESSAGE_REACTION.GRAPHEME });

  static isSingleEmoji ({ value }: EmojiValueDto): boolean {
    if (!value || [...value].length > MESSAGE_REACTION.MAX_LENGTH) return false;
    const graphemes = [...EmojiHelper.segmenter.segment(value)];
    return graphemes.length === 1 && MESSAGE_REACTION.EMOJI_PATTERN.test(value);
  }
}

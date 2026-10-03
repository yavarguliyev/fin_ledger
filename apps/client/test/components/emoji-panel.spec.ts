import { Injector, runInInjectionContext } from '@angular/core';

import { EMOJI_CATALOG } from '../../src/app/features/support/constants/emoji-catalog.constant';
import { EmojiPanelComponent } from '../../src/app/features/support/components/emoji-panel.component';
import { EMOJI_PANEL_TEST as T } from '../constants/emoji-panel.constant';

const segmenter = new Intl.Segmenter(undefined, { granularity: T.GRAPHEME });
const all = EMOJI_CATALOG.CATEGORIES.flatMap(category => category.emojis.split(EMOJI_CATALOG.SEPARATOR));

describe('Emoji panel', () => {
  it('lists only single emojis, each once', () => {
    expect(all.every(emoji => [...segmenter.segment(emoji)].length === 1)).toBe(true);
    expect(new Set(all).size).toBe(all.length);
  });

  it('shows the emojis of the chosen category', () => {
    const panel = runInInjectionContext(Injector.create({ providers: [] }), () => new EmojiPanelComponent());
    panel.active.set(T.SECOND_CATEGORY);

    expect(panel.emojis()).toEqual(EMOJI_CATALOG.CATEGORIES[T.SECOND_CATEGORY]?.emojis.split(EMOJI_CATALOG.SEPARATOR));
  });
});

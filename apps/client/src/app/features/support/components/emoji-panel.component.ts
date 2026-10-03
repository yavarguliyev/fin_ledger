import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { EMOJI_CATALOG } from '../constants/emoji-catalog.constant';

@Component({
  selector: 'app-emoji-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/emoji-panel.component.html'
})
export class EmojiPanelComponent {
  readonly picked = output<string>();
  readonly categories = EMOJI_CATALOG.CATEGORIES;
  readonly active = signal(0);
  readonly emojis = computed(() => this.categories[this.active()]?.emojis.split(EMOJI_CATALOG.SEPARATOR) ?? []);
}

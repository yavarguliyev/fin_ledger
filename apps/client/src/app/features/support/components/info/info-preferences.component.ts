import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CHAT_CLEAR } from '../../constants/chat-clear.constant';
import { CHAT_MUTE } from '../../constants/chat-mute.constant';
import { CHAT_THEME } from '../../constants/chat-theme.constant';
import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { InfoNavService } from '../../services/info-nav.service';
import { InfoRowComponent } from './info-row.component';
import { SupportChatStore } from '../../../../core/services/support-chat.store';
import { SupportPreferencesStore } from '../../../../core/services/support-preferences.store';

@Component({
  selector: 'app-info-preferences',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfoRowComponent],
  providers: [DatePipe],
  templateUrl: '../../templates/info/info-preferences.component.html'
})
export class InfoPreferencesComponent {
  private readonly chat = inject(SupportChatStore);
  private readonly date = inject(DatePipe);

  readonly nav = inject(InfoNavService);
  readonly preferences = inject(SupportPreferencesStore);
  readonly labels = CHAT_MUTE;
  readonly clearLabels = CHAT_CLEAR;
  readonly card = INFO_DIALOG.CARD;
  readonly pages = INFO_DIALOG.PAGES;
  readonly conversation = this.chat.activeConversation;
  readonly muteValue = computed(() => {
    const conversation = this.conversation();
    if (!conversation?.muted) return INFO_DIALOG.OFF;
    if (!conversation.mutedUntil) return CHAT_MUTE.ALWAYS;
    return `${CHAT_MUTE.UNTIL} ${this.date.transform(conversation.mutedUntil, CHAT_MUTE.UNTIL_FORMAT) ?? ''}`;
  });
  readonly themeValue = computed(() => {
    const theme = this.conversation()?.theme ?? CHAT_THEME.DEFAULT;
    return CHAT_THEME.LIST.find(item => item.theme === theme)?.label ?? '';
  });
}

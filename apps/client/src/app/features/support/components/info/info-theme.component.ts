import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';

import { CHAT_THEME } from '../../constants/chat-theme.constant';
import { SupportChatStore } from '../../../../core/services/support-chat.store';
import { SupportPreferencesStore } from '../../../../core/services/support-preferences.store';

@Component({
  selector: 'app-info-theme',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../../templates/info/info-theme.component.html'
})
export class InfoThemeComponent {
  private readonly chat = inject(SupportChatStore);

  readonly preferences = inject(SupportPreferencesStore);
  readonly labels = CHAT_THEME;
  readonly current = computed(() => this.chat.activeConversation()?.theme ?? CHAT_THEME.DEFAULT);
}

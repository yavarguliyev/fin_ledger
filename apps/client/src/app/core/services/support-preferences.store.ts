import { Injectable, inject } from '@angular/core';

import { CHAT_PREFERENCES } from '../constants/support/chat-preferences.constant';
import { FavouriteChoiceDto } from '../interfaces/support/favourite-choice.interface';
import { HttpRequestError } from '../errors/http-request.error';
import { MuteChoiceDto } from '../interfaces/support/mute-choice.interface';
import { PinChoiceDto } from '../interfaces/support/pin-choice.interface';
import { PreferenceChangeDto } from '../interfaces/support/preference-change.interface';
import { PreferenceRequestDto } from '../interfaces/support/preference-request.interface';
import { SupportChatStore } from './support-chat.store';
import { SupportPreferencesApiService } from './support-preferences-api.service';
import { ThemeChoiceDto } from '../interfaces/support/theme-choice.interface';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportPreferencesStore {
  private readonly api = inject(SupportPreferencesApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);

  mute ({ duration }: MuteChoiceDto): void {
    this.save({ path: CHAT_PREFERENCES.PATHS.MUTE, body: { duration } });
  }

  pin ({ pinned }: PinChoiceDto): void {
    this.save({ path: CHAT_PREFERENCES.PATHS.PIN, body: { pinned } });
  }

  favourite ({ favourite }: FavouriteChoiceDto): void {
    this.save({ path: CHAT_PREFERENCES.PATHS.FAVOURITE, body: { favourite } });
  }

  theme ({ theme }: ThemeChoiceDto): void {
    this.save({ path: CHAT_PREFERENCES.PATHS.THEME, body: { theme } });
  }

  private save ({ path, body }: PreferenceChangeDto): void {
    const conversation = this.chat.activeConversation();
    if (!conversation) return;
    this.apply({ request: this.api.update({ conversationId: conversation.id, path, body }) });
  }

  private apply ({ request }: PreferenceRequestDto): void {
    const conversationId = this.chat.activeId();
    request.subscribe({
      next: preferences => {
        const current = this.chat.conversations().find(item => item.id === conversationId);
        if (current) this.chat.upsertConversation({ conversation: { ...current, ...preferences } });
      },
      error: (error: unknown) => {
        const conflict = error instanceof HttpRequestError && error.status === CHAT_PREFERENCES.CONFLICT_STATUS;
        this.toast.error(conflict ? error.message : CHAT_PREFERENCES.SAVE_FAILED);
      }
    });
  }
}

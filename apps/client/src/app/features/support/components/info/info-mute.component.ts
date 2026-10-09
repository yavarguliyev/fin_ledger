import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { CHAT_MUTE } from '../../constants/chat-mute.constant';
import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { InfoNavService } from '../../services/info-nav.service';
import { MuteChoiceDto } from '../../../../core/interfaces/support/mute-choice.interface';
import { SupportChatStore } from '../../../../core/services/support-chat.store';
import { SupportPreferencesStore } from '../../../../core/services/support-preferences.store';

@Component({
  selector: 'app-info-mute',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../../templates/info/info-mute.component.html'
})
export class InfoMuteComponent {
  private readonly nav = inject(InfoNavService);
  private readonly preferences = inject(SupportPreferencesStore);

  readonly conversation = inject(SupportChatStore).activeConversation;
  readonly labels = CHAT_MUTE;
  readonly card = INFO_DIALOG.CARD;

  choose ({ duration }: MuteChoiceDto): void {
    this.preferences.mute({ duration });
    this.nav.back();
  }
}

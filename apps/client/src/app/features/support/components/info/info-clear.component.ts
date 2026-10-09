import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CHAT_CLEAR } from '../../constants/chat-clear.constant';
import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { InfoNavService } from '../../services/info-nav.service';
import { SupportHistoryStore } from '../../../../core/services/support-history.store';

@Component({
  selector: 'app-info-clear',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: '../../templates/info/info-clear.component.html'
})
export class InfoClearComponent {
  private readonly nav = inject(InfoNavService);

  readonly history = inject(SupportHistoryStore);
  readonly labels = CHAT_CLEAR;
  readonly card = INFO_DIALOG.CARD;
  readonly keepStarred = signal(true);

  confirm (): void {
    this.history.clear({ keepStarred: this.keepStarred() });
    this.nav.close();
  }
}

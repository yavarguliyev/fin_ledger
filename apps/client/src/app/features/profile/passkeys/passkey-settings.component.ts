import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { PASSKEY_MESSAGES } from '../../../core/constants/passkey/passkey-messages.constant';
import { PasskeyCeremonyService } from '../../../core/services/passkey-ceremony.service';
import { PasskeyHelper } from '../../../core/helpers/passkey/passkey.helper';
import { PasskeyService } from '../../../core/services/passkey.service';
import { RemovePasskeyDto } from '../../../core/interfaces/passkey/remove-passkey.interface';
import { SupportChatHelper } from '../../../core/helpers/support/support-chat.helper';
import { PasskeyListService } from './services/passkey-list.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../../core/constants/ui/load-state.constant';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-passkey-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, SkeletonComponent, ErrorStateComponent],
  providers: [PasskeyListService],
  templateUrl: './templates/passkey-settings.component.html'
})
export class PasskeySettingsComponent implements OnInit {
  private readonly ceremony = inject(PasskeyCeremonyService);
  private readonly passkeys = inject(PasskeyService);
  private readonly toast = inject(ToastService);

  readonly available = signal(PasskeyHelper.isAvailable());
  readonly busy = signal(false);
  readonly list = inject(PasskeyListService);
  readonly items = this.list.items;
  readonly neverUsed = PASSKEY_MESSAGES.NEVER_USED;
  readonly loadFailed = PASSKEY_MESSAGES.LOAD_FAILED;
  readonly states = LOAD_STATE;

  ngOnInit (): void {
    this.list.refresh();
  }

  onRemove (dto: RemovePasskeyDto): void {
    this.busy.set(true);
    this.passkeys.remove(dto).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success(PASSKEY_MESSAGES.REMOVED);
        this.list.refresh();
      },
      error: (err: unknown) => {
        this.busy.set(false);
        if (!SupportChatHelper.isSilent({ error: err })) this.toast.error(PASSKEY_MESSAGES.REMOVE_FAILED);
      }
    });
  }

  async onAdd (): Promise<void> {
    this.busy.set(true);
    const outcome = await this.ceremony.register({ deviceLabel: PasskeyHelper.deviceLabel() });
    this.busy.set(false);

    if (outcome === 'cancelled') {
      this.toast.info(PASSKEY_MESSAGES.NOTHING_ADDED);
      return;
    }

    if (outcome !== 'completed') {
      this.toast.error(outcome === 'unsupported' ? PASSKEY_MESSAGES.UNSUPPORTED : PASSKEY_MESSAGES.REGISTER_FAILED);
      return;
    }

    this.toast.success(PASSKEY_MESSAGES.REGISTERED);
    this.list.refresh();
  }
}

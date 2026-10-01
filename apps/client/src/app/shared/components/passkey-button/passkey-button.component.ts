import { Component, OnInit, inject, output, signal } from '@angular/core';

import { PASSKEY_MESSAGES } from '../../../core/constants/passkey/passkey-messages.constant';
import { PasskeyCeremonyService } from '../../../core/services/passkey-ceremony.service';
import { PasskeyHelper } from '../../../core/helpers/passkey/passkey.helper';

@Component({
  selector: 'app-passkey-button',
  standalone: true,
  templateUrl: './passkey-button.component.html'
})
export class PasskeyButtonComponent implements OnInit {
  private readonly ceremony = inject(PasskeyCeremonyService);

  readonly signedIn = output<void>();

  readonly available = signal(PasskeyHelper.isAvailable());
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly hint = signal<string | null>(null);
  readonly label = signal<string>(PASSKEY_MESSAGES.PASSKEY_LABEL);

  ngOnInit (): void {
    void this.detectSupport();
  }

  async onClick (): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    this.hint.set(null);

    const outcome = await this.ceremony.login();

    this.busy.set(false);

    if (outcome === 'completed') {
      this.signedIn.emit();
      return;
    }

    if (outcome === 'cancelled') this.hint.set(PASSKEY_MESSAGES.NOTHING_USED);
    else this.error.set(outcome === 'unsupported' ? PASSKEY_MESSAGES.UNSUPPORTED : PASSKEY_MESSAGES.LOGIN_FAILED);
  }

  private async detectSupport (): Promise<void> {
    if (await PasskeyHelper.isPlatformAvailable()) this.label.set(PASSKEY_MESSAGES.BIOMETRIC_LABEL);
  }
}

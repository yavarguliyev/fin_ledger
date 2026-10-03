import { Injectable, inject, signal } from '@angular/core';

import { PasskeyService } from '../../../../core/services/passkey.service';
import { PasskeySummary } from '../../../../core/interfaces/passkey/passkey-summary.interface';

@Injectable()
export class PasskeyListService {
  private readonly passkeys = inject(PasskeyService);

  readonly items = signal<PasskeySummary[]>([]);
  readonly loaded = signal(false);
  readonly failed = signal(false);

  refresh (): void {
    this.failed.set(false);
    this.passkeys.list().subscribe({
      next: items => {
        this.items.set(items);
        this.loaded.set(true);
      },
      error: () => this.failed.set(true)
    });
  }
}

import { Injectable, inject, signal } from '@angular/core';

import { MfaService } from '../../../../core/services/mfa.service';
import { MfaStatus } from '../../../../core/interfaces/auth/mfa-status.interface';

@Injectable()
export class MfaStatusService {
  private readonly mfa = inject(MfaService);

  readonly status = signal<MfaStatus | null>(null);
  readonly failed = signal(false);

  refresh (): void {
    this.failed.set(false);
    this.mfa.getStatus().subscribe({
      next: status => this.status.set(status),
      error: () => this.failed.set(true)
    });
  }
}

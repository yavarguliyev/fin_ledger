import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ACCOUNT } from '../../core/constants/account/account.constant';
import { SESSION } from '../../core/constants/auth/session.constant';

@Component({
  selector: 'app-confirm-email-change',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './templates/confirm-email-change.component.html'
})
export class ConfirmEmailChangeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit (): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading.set(false);
      this.error.set(ACCOUNT.CONFIRM_FALLBACK);
      return;
    }

    this.account.confirmEmailChange({ token }).subscribe({
      next: response => {
        this.auth.forgetSession();
        this.toast.success(response.message);
        void this.router.navigate([SESSION.LOGIN_ROUTE]);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message || ACCOUNT.CONFIRM_FALLBACK);
      }
    });
  }
}

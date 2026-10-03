import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { PAYMENT_METHOD_STATUS } from '../../../core/constants/payment/payment-method-status.constant';
import { PaymentMethod } from '../../../core/types/payment-method/payment-method.type';
import { PaymentMethodService } from '../../../core/services/payment-method.service';

@Injectable()
export class WithdrawMethodsService {
  private readonly api = inject(PaymentMethodService);

  readonly all = signal<PaymentMethod[]>([]);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly verified = computed(() => this.all().filter(method => method.status === PAYMENT_METHOD_STATUS.VERIFIED));

  load (): Observable<PaymentMethod[]> {
    this.loading.set(true);
    this.failed.set(false);
    return this.api.list().pipe(
      tap({
        next: methods => {
          this.all.set(methods);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.failed.set(true);
        }
      })
    );
  }
}

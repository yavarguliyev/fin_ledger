import { Injectable, signal, computed } from '@angular/core';

import { ConfirmToast } from '../interfaces/ui/confirm-toast.interface';
import { Toast } from '../interfaces/ui/toast.interface';
import { UuidHelper } from '../helpers/common/uuid.helper';
import { ShowToastDto } from '../interfaces/ui/show-toast.interface';
import { RequestConfirmDto } from '../interfaces/ui/request-confirm.interface';
import { TOAST } from '../constants/ui/toast.constant';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private readonly confirmToastSignal = signal<ConfirmToast | null>(null);

  readonly toasts = computed(() => this.toastsSignal());
  readonly confirmToast = computed(() => this.confirmToastSignal());

  success (message: string): void {
    this.show({ message, type: 'success' });
  }

  error (message: string): void {
    this.show({ message, type: 'error' });
  }

  warning (message: string): void {
    this.show({ message, type: 'warning' });
  }

  info (message: string): void {
    this.show({ message, type: 'info' });
  }

  dismiss (id: string): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }

  dismissConfirm (): void {
    this.confirmToastSignal.set(null);
  }

  show ({ message, type = TOAST.DEFAULT_TYPE }: ShowToastDto): void {
    const id = UuidHelper.generate();
    this.toastsSignal.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), TOAST.DISMISS_MS);
  }

  confirm ({ message, onConfirm, onCancel }: RequestConfirmDto): void {
    const id = UuidHelper.generate();
    this.confirmToastSignal.set({
      id,
      message,
      onConfirm: () => {
        onConfirm();
        this.confirmToastSignal.set(null);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        this.confirmToastSignal.set(null);
      }
    });
  }
}

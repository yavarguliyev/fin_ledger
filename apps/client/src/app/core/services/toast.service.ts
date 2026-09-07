import { Injectable, signal, computed } from '@angular/core';

import { uuid } from '../utils/uuid.util';
import { Toast, ConfirmToast } from '../models/style.model';
import { ToastType } from '../models/base.mode';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private readonly confirmToastSignal = signal<ConfirmToast | null>(null);

  readonly toasts = computed(() => this.toastsSignal());
  readonly confirmToast = computed(() => this.confirmToastSignal());

  show (message: string, type: ToastType = 'info'): void {
    const id = uuid();
    this.toastsSignal.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }

  success (message: string): void {
    this.show(message, 'success');
  }

  error (message: string): void {
    this.show(message, 'error');
  }

  warning (message: string): void {
    this.show(message, 'warning');
  }

  info (message: string): void {
    this.show(message, 'info');
  }

  dismiss (id: string): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }

  dismissConfirm (): void {
    this.confirmToastSignal.set(null);
  }

  confirm (message: string, onConfirm: () => void, onCancel?: () => void): void {
    const id = uuid();
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

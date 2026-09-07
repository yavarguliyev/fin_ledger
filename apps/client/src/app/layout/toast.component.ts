import { Component, inject, computed } from '@angular/core';

import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [],
  templateUrl: './templates/toast.component.html'
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = computed(() => this.toastService.toasts());
  readonly confirmToast = computed(() => this.toastService.confirmToast());

  dismiss (id: string): void {
    this.toastService.dismiss(id);
  }

  icon (type: string): string {
    const map: Record<string, string> = { success: '✅', error: '⛔', warning: '⚠️', info: 'ℹ️' };
    return map[type] ?? 'ℹ️';
  }

  handleConfirm (): void {
    const confirm = this.confirmToast();
    if (confirm) confirm.onConfirm();
  }

  handleCancel (): void {
    const confirm = this.confirmToast();
    if (confirm) confirm.onCancel();
  }
}

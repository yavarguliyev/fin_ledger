import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';

import { ToastService } from '../core/services/toast.service';
import { TOAST_ICONS } from '../core/constants/ui/toast.constant';
import { ToastType } from '../core/types/ui/toast-type.type';
import { IconName } from '../core/types/ui/icon-name.type';
import { IconComponent } from '../shared/components/icon/icon.component';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './templates/toast.component.html'
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = computed(() => this.toastService.toasts());
  readonly confirmToast = computed(() => this.toastService.confirmToast());

  dismiss (id: string): void {
    this.toastService.dismiss(id);
  }

  icon (type: ToastType): IconName {
    return TOAST_ICONS[type];
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

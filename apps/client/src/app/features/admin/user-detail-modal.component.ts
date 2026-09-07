import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminUser } from '../../core/models/admin.model';
import { formatCurrency } from '../../core/utils/currency.util';

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './templates/user-detail-modal.component.html'
})
export class UserDetailModalComponent {
  readonly user = input.required<AdminUser | null>();

  formatCurrency (amount: number, currency: string): string {
    return formatCurrency(amount, currency);
  }
}

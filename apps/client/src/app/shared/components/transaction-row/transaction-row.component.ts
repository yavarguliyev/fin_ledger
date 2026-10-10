import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Transaction } from '../../../core/types/wallet/transaction.type';
import { TransactionHelper } from '../../../core/helpers/wallet/transaction.helper';
import { TRANSACTION_ROW } from '../../../core/constants/wallet/transaction-row.constant';
import { ReferenceHelper } from '../../../core/helpers/common/reference.helper';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { IconComponent } from '../icon/icon.component';
import { ReceiptLinkComponent } from '../receipt-link/receipt-link.component';

@Component({
  selector: 'app-transaction-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [DatePipe, CurrencyFormatPipe, IconComponent, ReceiptLinkComponent],
  templateUrl: './transaction-row.component.html'
})
export class TransactionRowComponent {
  readonly row = input.required<Transaction>();
  readonly detailed = input(false);

  readonly view = TRANSACTION_ROW;
  readonly icon = computed(() => TransactionHelper.typeIcon(this.row().type));
  readonly title = computed(() => TRANSACTION_ROW.TITLES[this.row().type] ?? TRANSACTION_ROW.FALLBACK.TITLE);
  readonly tone = computed(() => TRANSACTION_ROW.TONES[this.row().type] ?? TRANSACTION_ROW.FALLBACK.TONE);
  readonly statusTone = computed(() => TRANSACTION_ROW.STATUSES[this.row().status] ?? TRANSACTION_ROW.FALLBACK.STATUS);
  readonly sign = computed(() => (this.row().amountMinor > 0 ? TRANSACTION_ROW.POSITIVE_SIGN : ''));
  readonly amountTone = computed(() => (this.row().amountMinor < 0 ? TRANSACTION_ROW.AMOUNT.NEGATIVE : TRANSACTION_ROW.AMOUNT.POSITIVE));
  readonly reference = computed(() => ReferenceHelper.short({ reference: this.row().reference }));
}

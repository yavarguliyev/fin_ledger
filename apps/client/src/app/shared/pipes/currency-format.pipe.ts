import { Pipe } from '@angular/core';

import { formatCurrency } from '../../core/helpers/currency.helper';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe {
  transform (amountMinor: string | number | null | undefined, currency = 'USD'): string {
    return amountMinor === null || amountMinor === undefined ? '-' : formatCurrency(Number(amountMinor), currency);
  }
}

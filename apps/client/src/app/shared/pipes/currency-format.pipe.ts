import { Pipe } from '@angular/core';
import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';


@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe {
  transform (amountMinor: string | number | null | undefined, currency = 'USD'): string {
    return amountMinor === null || amountMinor === undefined ? '-' : CurrencyHelper.formatCurrency(Number(amountMinor), currency);
  }
}

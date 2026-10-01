import { Pipe } from '@angular/core';

import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';
import { CURRENCY } from '../../core/constants/wallet/currency.constant';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe {
  transform (amountMinor: string | number | null | undefined, currency: string = CURRENCY.DEFAULT): string {
    if (amountMinor === null || amountMinor === undefined) return CURRENCY.EMPTY;
    return CurrencyHelper.formatCurrency({ amountMinor: Number(amountMinor), currency });
  }
}

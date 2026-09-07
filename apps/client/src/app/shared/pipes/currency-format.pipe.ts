import { Pipe } from '@angular/core';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe {
  transform (amountMinor: string | number | null | undefined, currency = 'USD'): string {
    return amountMinor === null || amountMinor === undefined
      ? '-'
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(parseInt(String(amountMinor), 10) / 100);
  }
}

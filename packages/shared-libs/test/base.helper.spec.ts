import { BaseHelper } from '../modules/helpers/base.helper';

describe('BaseHelper.formatAmount', () => {
  it.each([
    [12345, 'USD', '123.45 USD'],
    [12345, 'JPY', '12345 JPY'],
    [12345, 'KWD', '12.345 KWD'],
    [5, 'EUR', '0.05 EUR']
  ])('formats %i minor units of %s as %s', (amountMinor, currency, expected) => {
    expect(BaseHelper.formatAmount({ amountMinor, currency })).toBe(expected);
  });
});

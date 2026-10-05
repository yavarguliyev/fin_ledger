import { VolumeCurrencyStore } from '../../src/app/core/services/volume-currency.store';
import { VOLUME_CURRENCY } from '../../src/app/core/constants/admin/volume-currency.constant';
import { VOLUME_CURRENCY_TEST as T } from '../constants/volume-currency.constant';

describe('Admin volume currency', () => {
  beforeEach(() => localStorage.removeItem(VOLUME_CURRENCY.STORAGE_KEY));

  it('remembers the chosen currency for the next visit', () => {
    new VolumeCurrencyStore().choose(T.CHOSEN);

    expect(new VolumeCurrencyStore().selected()).toBe(T.CHOSEN);
  });

  it('starts with no choice so the largest currency is shown', () => {
    expect(new VolumeCurrencyStore().selected()).toBeNull();
  });
});

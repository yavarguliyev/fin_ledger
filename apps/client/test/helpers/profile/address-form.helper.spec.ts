import { AddressFormHelper } from '../../../src/app/features/profile/address/helpers/address-form.helper';
import { ADDRESS_TEST as T } from '../../constants/address.constant';

describe('AddressFormHelper.payload', () => {
  it('trims text, drops blank optional fields and keeps the pin and source', () => {
    const payload = AddressFormHelper.payload({ value: { ...T.VALUE }, source: T.MAP_SOURCE, pin: T.PIN });

    expect(payload).toEqual({
      line1: T.TRIMMED_LINE1,
      city: T.VALUE.city,
      countryCode: T.VALUE.countryCode,
      postalCode: T.VALUE.postalCode,
      source: T.MAP_SOURCE,
      ...T.PIN
    });
  });

  it('sends no coordinates when nothing was pinned', () => {
    expect(AddressFormHelper.payload({ value: { ...T.VALUE }, source: T.MAP_SOURCE, pin: null })).not.toHaveProperty('latitude');
  });
});

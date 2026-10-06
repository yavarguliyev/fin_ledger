import { ADDRESS_MESSAGES } from '../../../src/app/core/constants/address/address-messages.constant';
import { GeolocationHelper } from '../../../src/app/core/helpers/address/geolocation.helper';
import { ADDRESS_TEST as T } from '../../constants/address.constant';

describe('GeolocationHelper.messageFor', () => {
  it('explains each browser failure in plain words and keeps manual entry open', () => {
    expect(GeolocationHelper.messageFor({ code: T.DENIED_CODE })).toBe(ADDRESS_MESSAGES.DENIED);
    expect(GeolocationHelper.messageFor({ code: T.UNAVAILABLE_CODE })).toBe(ADDRESS_MESSAGES.UNAVAILABLE);
    expect(GeolocationHelper.messageFor({ code: T.TIMEOUT_CODE })).toBe(ADDRESS_MESSAGES.TIMEOUT);
    expect(GeolocationHelper.messageFor({ code: null })).toBe(ADDRESS_MESSAGES.UNSUPPORTED);
  });

  it('builds an empty address at the pin when nothing was found there', () => {
    expect(GeolocationHelper.blankAt(T.PIN)).toMatchObject({ ...T.PIN, line1: null, countryCode: null });
  });
});

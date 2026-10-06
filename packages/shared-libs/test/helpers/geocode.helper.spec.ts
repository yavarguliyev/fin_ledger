import { GeocodeHelper } from '../../src/modules/helpers/geocode.helper';
import { GEOCODE_SPEC as T } from '../constants/geocode.constant';

describe('GeocodeHelper.toAddress', () => {
  it('maps a full result into address fields with an upper-case country code', () => {
    expect(GeocodeHelper.toAddress({ place: T.FULL })).toEqual(T.FULL_RESULT);
  });

  it('falls back to village and county when there is no city or state', () => {
    expect(GeocodeHelper.toAddress({ place: T.VILLAGE })).toMatchObject({ city: T.VILLAGE_CITY, region: T.VILLAGE_REGION, line1: null });
  });

  it('keeps the coordinates when the result has no address details', () => {
    expect(GeocodeHelper.toAddress({ place: T.BARE })).toMatchObject({ line1: null, countryCode: null, latitude: Number(T.BARE.lat), longitude: Number(T.BARE.lon) });
  });
});

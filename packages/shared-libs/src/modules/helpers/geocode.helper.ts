import { GEOCODE } from '../constants/geocode/geocode.constant';
import { GeocodedAddressDto } from '../dtos/geocode/geocoded-address.dto';
import { GeocodePickDto } from '../dtos/geocode/geocode-pick.dto';
import { GeocodePlaceRefDto } from '../dtos/geocode/geocode-place-ref.dto';

export class GeocodeHelper {
  static toAddress ({ place }: GeocodePlaceRefDto): GeocodedAddressDto {
    const address = place.address ?? {};
    const street = GeocodeHelper.pick({ address, keys: [...GEOCODE.STREET_KEYS] });
    const line1 = [address['house_number'], street].filter(Boolean).join(GEOCODE.SPACE) || null;
    const country = address['country_code']?.toUpperCase() ?? null;

    return {
      label: place.display_name,
      line1,
      city: GeocodeHelper.pick({ address, keys: [...GEOCODE.CITY_KEYS] }),
      region: GeocodeHelper.pick({ address, keys: [...GEOCODE.REGION_KEYS] }),
      postalCode: address['postcode'] ?? null,
      countryCode: country?.length === GEOCODE.COUNTRY_CODE_LENGTH ? country : null,
      latitude: Number(place.lat),
      longitude: Number(place.lon)
    };
  }

  private static pick ({ address, keys }: GeocodePickDto): string | null {
    return keys.map(key => address[key]).find(Boolean) ?? null;
  }
}

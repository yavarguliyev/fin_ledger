import { ServiceUnavailableException } from '@nestjs/common';
import { GeocodePlaceDto } from '@common/libs';

import { GEOCODER } from '../constants/address/geocode.constant';
import { GeocodeUrlDto } from '../dtos/address/geocode-url.dto';

export class GeocodeFetchHelper {
  static async places ({ url }: GeocodeUrlDto): Promise<GeocodePlaceDto[]> {
    const response = await fetch(url, { headers: GEOCODER.HEADERS, signal: AbortSignal.timeout(GEOCODER.TIMEOUT_MS) }).catch(() => null);
    if (!response?.ok) throw new ServiceUnavailableException(GEOCODER.UNAVAILABLE_MESSAGE);

    const body = (await response.json()) as GeocodePlaceDto[] | GeocodePlaceDto;
    return (Array.isArray(body) ? body : [body]).filter(place => !!place.display_name);
  }
}

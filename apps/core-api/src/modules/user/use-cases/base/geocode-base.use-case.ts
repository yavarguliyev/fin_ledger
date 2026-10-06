import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeocodedAddressDto, GeocodeHelper } from '@common/libs';

import { GEOCODER } from '../../constants/address/geocode.constant';
import { GeocodeFetchHelper } from '../../helpers/geocode-fetch.helper';
import { GeocodeLookupDto } from '../../dtos/address/geocode-lookup.dto';

export abstract class GeocodeBaseUseCase<TInput, TOutput> {
  @Inject(ConfigService)
  protected readonly configService!: ConfigService;

  abstract execute(input: TInput): Promise<TOutput>;

  protected async lookup ({ path, params }: GeocodeLookupDto): Promise<GeocodedAddressDto[]> {
    const url = new URL(path, this.configService.get<string>(GEOCODER.BASE_URL_KEY) ?? GEOCODER.DEFAULT_BASE_URL);
    Object.entries({ ...params, [GEOCODER.FORMAT_PARAM]: GEOCODER.FORMAT, [GEOCODER.DETAILS_PARAM]: GEOCODER.DETAILS }).forEach(([key, value]) => url.searchParams.set(key, value));

    const places = await GeocodeFetchHelper.places({ url });
    return places.map(place => GeocodeHelper.toAddress({ place }));
  }
}

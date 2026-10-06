import { Injectable } from '@nestjs/common';
import { GeocodedAddressDto } from '@common/libs';

import { GEOCODER } from '../../constants/address/geocode.constant';
import { GeocodeBaseUseCase } from '../base/geocode-base.use-case';
import { ReverseGeocodeRequestDto } from '../../dtos/address/reverse-geocode-request.dto';

@Injectable()
export class ReverseGeocodeUseCase extends GeocodeBaseUseCase<ReverseGeocodeRequestDto, GeocodedAddressDto[]> {
  async execute ({ latitude, longitude }: ReverseGeocodeRequestDto): Promise<GeocodedAddressDto[]> {
    return this.lookup({ path: GEOCODER.REVERSE_PATH, params: { [GEOCODER.LAT_PARAM]: String(latitude), [GEOCODER.LON_PARAM]: String(longitude) } });
  }
}

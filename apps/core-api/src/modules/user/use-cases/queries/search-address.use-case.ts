import { Injectable } from '@nestjs/common';
import { GeocodedAddressDto } from '@common/libs';

import { AddressSearchRequestDto } from '../../dtos/address/address-search-request.dto';
import { GEOCODER } from '../../constants/address/geocode.constant';
import { GeocodeBaseUseCase } from '../base/geocode-base.use-case';

@Injectable()
export class SearchAddressUseCase extends GeocodeBaseUseCase<AddressSearchRequestDto, GeocodedAddressDto[]> {
  async execute ({ q }: AddressSearchRequestDto): Promise<GeocodedAddressDto[]> {
    return this.lookup({ path: GEOCODER.SEARCH_PATH, params: { [GEOCODER.QUERY_PARAM]: q, [GEOCODER.LIMIT_PARAM]: GEOCODER.LIMIT } });
  }
}

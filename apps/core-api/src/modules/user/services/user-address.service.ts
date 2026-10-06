import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Cacheable, GeocodedAddressDto, RateLimited } from '@common/libs';

import { AddressDto } from '../dtos/address/address.dto';
import { AddressSearchRequestDto } from '../dtos/address/address-search-request.dto';
import { DeleteAddressUseCase } from '../use-cases/commands/delete-address.use-case';
import { GEOCODER } from '../constants/address/geocode.constant';
import { GetAddressUseCase } from '../use-cases/queries/get-address.use-case';
import { ReverseGeocodeRequestDto } from '../dtos/address/reverse-geocode-request.dto';
import { ReverseGeocodeUseCase } from '../use-cases/queries/reverse-geocode.use-case';
import { SaveAddressDto } from '../dtos/address/save-address.dto';
import { SaveAddressUseCase } from '../use-cases/commands/save-address.use-case';
import { SearchAddressUseCase } from '../use-cases/queries/search-address.use-case';
import { UserIdRequestDto } from '../dtos/request/user-id-request.dto';

@Injectable()
export class UserAddressService {
  constructor (
    private readonly getAddressUseCase: GetAddressUseCase,
    private readonly saveAddressUseCase: SaveAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly searchAddressUseCase: SearchAddressUseCase,
    private readonly reverseGeocodeUseCase: ReverseGeocodeUseCase
  ) {}

  async get (dto: UserIdRequestDto): Promise<AddressDto | null> {
    return this.getAddressUseCase.execute(dto);
  }

  async save (dto: SaveAddressDto): Promise<AddressDto> {
    return this.saveAddressUseCase.execute(dto);
  }

  async remove (dto: UserIdRequestDto): Promise<void> {
    return this.deleteAddressUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: GEOCODER.SEARCH_CACHE, ttlSeconds: GEOCODER.CACHE_TTL_SECONDS })
  @RateLimited({ key: GEOCODER.RATE_KEY, limit: GEOCODER.RATE_LIMIT, windowMs: GEOCODER.RATE_WINDOW_MS, error: () => new ServiceUnavailableException(GEOCODER.UNAVAILABLE_MESSAGE) })
  async search (dto: AddressSearchRequestDto): Promise<GeocodedAddressDto[]> {
    return this.searchAddressUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: GEOCODER.REVERSE_CACHE, ttlSeconds: GEOCODER.CACHE_TTL_SECONDS })
  @RateLimited({ key: GEOCODER.RATE_KEY, limit: GEOCODER.RATE_LIMIT, windowMs: GEOCODER.RATE_WINDOW_MS, error: () => new ServiceUnavailableException(GEOCODER.UNAVAILABLE_MESSAGE) })
  async reverse (dto: ReverseGeocodeRequestDto): Promise<GeocodedAddressDto[]> {
    return this.reverseGeocodeUseCase.execute(dto);
  }
}

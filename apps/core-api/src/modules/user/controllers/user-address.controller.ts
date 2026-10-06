import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, GeocodedAddressDto, ParamsQueryAndHeaders, RequestContext, SessionGuard, UserRateLimit } from '@common/libs';

import { AddressDto } from '../dtos/address/address.dto';
import { AddressRequestDto, AddressRequestSchema } from '../dtos/address/address-request.dto';
import { AddressSearchRequestDto, AddressSearchRequestSchema } from '../dtos/address/address-search-request.dto';
import { ReverseGeocodeRequestDto, ReverseGeocodeRequestSchema } from '../dtos/address/reverse-geocode-request.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { UserAddressService } from '../services/user-address.service';

@ApiTags(SHARED_CONSTANTS.USER.key)
@ApiBearerAuth('bearer')
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.USER, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class UserAddressController {
  constructor (private readonly userAddressService: UserAddressService) {}

  @Get('me/address')
  async get (@Req() req: RequestContext): Promise<AddressDto | null> {
    return this.userAddressService.get({ userId: req.user.userId });
  }

  @UserRateLimit()
  @Put('me/address')
  async save (@Req() req: RequestContext, @Body({ schema: AddressRequestSchema }) dto: AddressRequestDto): Promise<AddressDto> {
    return this.userAddressService.save({ ...dto, userId: req.user.userId });
  }

  @Delete('me/address')
  async remove (@Req() req: RequestContext): Promise<void> {
    return this.userAddressService.remove({ userId: req.user.userId });
  }

  @UserRateLimit()
  @Get('me/address/search')
  async search (@ParamsQueryAndHeaders({ schema: AddressSearchRequestSchema }) dto: AddressSearchRequestDto): Promise<GeocodedAddressDto[]> {
    return this.userAddressService.search(dto);
  }

  @UserRateLimit()
  @Get('me/address/reverse')
  async reverse (@ParamsQueryAndHeaders({ schema: ReverseGeocodeRequestSchema }) dto: ReverseGeocodeRequestDto): Promise<GeocodedAddressDto[]> {
    return this.userAddressService.reverse(dto);
  }
}

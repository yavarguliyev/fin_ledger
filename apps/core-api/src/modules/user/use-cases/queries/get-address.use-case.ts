import { Injectable } from '@nestjs/common';

import { UserAddressRepository } from '../../repositories/user-address.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { AddressDto } from '../../dtos/address/address.dto';
import { UserIdRequestDto } from '../../dtos/request/user-id-request.dto';

@Injectable()
export class GetAddressUseCase extends UserBaseCase<UserIdRequestDto, AddressDto | null> {
  constructor (private readonly addressRepository: UserAddressRepository) {
    super();
  }

  async execute ({ userId }: UserIdRequestDto): Promise<AddressDto | null> {
    return this.addressRepository.findForUser({ userId });
  }
}

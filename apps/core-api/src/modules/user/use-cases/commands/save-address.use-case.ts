import { InternalServerErrorException, Injectable } from '@nestjs/common';

import { UserAddressRepository } from '../../repositories/user-address.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { AddressDto } from '../../dtos/address/address.dto';
import { SaveAddressDto } from '../../dtos/address/save-address.dto';

@Injectable()
export class SaveAddressUseCase extends UserBaseCase<SaveAddressDto, AddressDto> {
  constructor (private readonly addressRepository: UserAddressRepository) {
    super();
  }

  async execute (dto: SaveAddressDto): Promise<AddressDto> {
    const saved = await this.addressRepository.save(dto);
    if (!saved) throw new InternalServerErrorException();
    return saved;
  }
}

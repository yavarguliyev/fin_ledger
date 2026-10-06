import { Injectable } from '@nestjs/common';

import { UserAddressRepository } from '../../repositories/user-address.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserIdRequestDto } from '../../dtos/request/user-id-request.dto';

@Injectable()
export class DeleteAddressUseCase extends UserBaseCase<UserIdRequestDto, void> {
  constructor (private readonly addressRepository: UserAddressRepository) {
    super();
  }

  async execute ({ userId }: UserIdRequestDto): Promise<void> {
    await this.addressRepository.remove({ userId });
  }
}

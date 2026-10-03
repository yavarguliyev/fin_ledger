import { Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { UserDeviceRepository } from '../../repositories/user-device.repository';
import { SharedDeviceDto } from '../../dtos/device/shared-device.dto';

@Injectable()
export class ListSharedDevicesUseCase extends AuthBaseUseCase<void, SharedDeviceDto[]> {
  constructor (private readonly userDeviceRepository: UserDeviceRepository) {
    super();
  }

  async execute (): Promise<SharedDeviceDto[]> {
    return this.userDeviceRepository.findSharedDevices();
  }
}

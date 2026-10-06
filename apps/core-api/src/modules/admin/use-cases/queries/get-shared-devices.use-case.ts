import { Injectable } from '@nestjs/common';

import { DeviceTrackerService, SharedDeviceDto } from '../../../auth';

@Injectable()
export class GetSharedDevicesUseCase {
  constructor (private readonly deviceTracker: DeviceTrackerService) {}

  async execute (): Promise<SharedDeviceDto[]> {
    return this.deviceTracker.sharedDevices();
  }
}

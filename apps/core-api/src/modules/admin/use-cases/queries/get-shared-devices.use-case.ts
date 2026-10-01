import { Injectable } from '@nestjs/common';

import { DeviceTrackerService } from '../../../auth/services/device-tracker.service';
import { SharedDeviceDto } from '../../../auth/dtos/device/shared-device.dto';

@Injectable()
export class GetSharedDevicesUseCase {
  constructor (private readonly deviceTracker: DeviceTrackerService) {}

  async execute (): Promise<SharedDeviceDto[]> {
    return this.deviceTracker.sharedDevices();
  }
}

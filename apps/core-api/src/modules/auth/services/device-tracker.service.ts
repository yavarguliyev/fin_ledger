import { Injectable } from '@nestjs/common';

import { TrackDeviceUseCase } from '../use-cases/commands/device/track-device.use-case';
import { ListSharedDevicesUseCase } from '../use-cases/queries/list-shared-devices.use-case';
import { TrackDeviceDto } from '../dtos/device/track-device.dto';
import { SharedDeviceDto } from '../dtos/device/shared-device.dto';

@Injectable()
export class DeviceTrackerService {
  constructor (
    private readonly trackDeviceUseCase: TrackDeviceUseCase,
    private readonly listSharedDevicesUseCase: ListSharedDevicesUseCase
  ) {}

  async track (dto: TrackDeviceDto): Promise<void> {
    return this.trackDeviceUseCase.execute(dto);
  }

  async sharedDevices (): Promise<SharedDeviceDto[]> {
    return this.listSharedDevicesUseCase.execute();
  }
}

import { Injectable } from '@nestjs/common';
import { Cacheable } from '@common/libs';

import { AdminDashboardDto } from './dtos/dashboard/admin-dashboard.dto';
import { GetAdminDashboardUseCase } from './use-cases/queries/get-admin-dashboard.use-case';
import { GetSharedDevicesUseCase } from './use-cases/queries/get-shared-devices.use-case';
import { SharedDeviceDto } from '../auth/dtos/device/shared-device.dto';

@Injectable()
export class AdminService {
  constructor (
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
    private readonly getSharedDevicesUseCase: GetSharedDevicesUseCase
  ) {}

  @Cacheable({ keyPrefix: 'admin-dashboard', ttlSeconds: 120 })
  async getAdminDashboard (): Promise<AdminDashboardDto> {
    return this.getAdminDashboardUseCase.execute();
  }

  async getSharedDevices (): Promise<SharedDeviceDto[]> {
    return this.getSharedDevicesUseCase.execute();
  }
}

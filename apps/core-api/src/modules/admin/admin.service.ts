import { Injectable } from '@nestjs/common';
import { Cacheable } from '@common/libs';

import { AdminDashboardDto } from './dtos/dashboard/admin-dashboard.dto';
import { GetAdminDashboardUseCase } from './use-cases/queries/get-admin-dashboard.use-case';
import { ListAdminUsersUseCase } from './use-cases/queries/list-admin-users.use-case';
import { ListAdminUsersRequestDto } from './dtos/request/list-admin-users-request.dto';
import { GetSharedDevicesUseCase } from './use-cases/queries/get-shared-devices.use-case';
import { SharedDeviceDto } from '../auth';
import { UserWithWalletDto } from '../user';

@Injectable()
export class AdminService {
  constructor (
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
    private readonly listAdminUsersUseCase: ListAdminUsersUseCase,
    private readonly getSharedDevicesUseCase: GetSharedDevicesUseCase
  ) {}

  @Cacheable({ keyPrefix: 'admin-dashboard', ttlSeconds: 120 })
  async getAdminDashboard (): Promise<AdminDashboardDto> {
    return this.getAdminDashboardUseCase.execute();
  }

  async listUsers (dto: ListAdminUsersRequestDto): Promise<UserWithWalletDto[]> {
    return this.listAdminUsersUseCase.execute(dto);
  }

  async getSharedDevices (): Promise<SharedDeviceDto[]> {
    return this.getSharedDevicesUseCase.execute();
  }
}

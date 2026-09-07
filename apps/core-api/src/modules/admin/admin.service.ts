import { Injectable } from '@nestjs/common';
import { Cacheable } from '@common/libs';

import { AdminDashboardDto } from './dtos/admin-dashboard.dto';
import { GetAdminDashboardUseCase } from './use-cases/queries/get-admin-dashboard.use-case';

@Injectable()
export class AdminService {
  constructor (private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase) {}

  @Cacheable({ keyPrefix: 'admin-dashboard', ttlSeconds: 120 })
  async getAdminDashboard (): Promise<AdminDashboardDto> {
    return this.getAdminDashboardUseCase.execute();
  }
}

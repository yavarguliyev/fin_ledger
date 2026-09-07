import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, SessionGuard, RolesGuard, Roles, UserRoles } from '@common/libs';

import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';
import { AdminService } from './admin.service';
import { AdminDashboardDto } from './dtos/admin-dashboard.dto';

@ApiTags(SHARED_CONSTANTS.ADMIN.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles(UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.ADMIN, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class AdminController {
  constructor (private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getAdminDashboard (): Promise<AdminDashboardDto> {
    return this.adminService.getAdminDashboard();
  }
}

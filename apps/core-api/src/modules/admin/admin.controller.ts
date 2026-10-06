import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, SessionGuard, RolesGuard, Roles, UserRoles } from '@common/libs';

import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { AdminService } from './admin.service';
import { AdminDashboardDto } from './dtos/dashboard/admin-dashboard.dto';
import { SharedDeviceDto } from '../auth';
import { UserWithWalletDto } from '../user';
import { ADMIN_USERS } from './constants/users/admin-users.constant';
import { ListAdminUsersRequestDto, ListAdminUsersRequestSchema } from './dtos/request/list-admin-users-request.dto';

@ApiTags(SHARED_CONSTANTS.ADMIN.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.ADMIN, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class AdminController {
  constructor (private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getAdminDashboard (): Promise<AdminDashboardDto> {
    return this.adminService.getAdminDashboard();
  }

  @Get(ADMIN_USERS.PATH)
  async listUsers (@ParamsQueryAndHeaders({ schema: ListAdminUsersRequestSchema }) dto: ListAdminUsersRequestDto): Promise<UserWithWalletDto[]> {
    return this.adminService.listUsers(dto);
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Get('shared-devices')
  async getSharedDevices (): Promise<SharedDeviceDto[]> {
    return this.adminService.getSharedDevices();
  }
}

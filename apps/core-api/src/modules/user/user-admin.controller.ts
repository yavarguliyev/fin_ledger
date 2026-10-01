import { Body, Controller, Patch, UseGuards, Req, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ENVIRONMENT_CONSTANTS,
  SessionGuard,
  RequestContext,
  Roles,
  UserRoles,
  UserStatus,
  RolesGuard,
  Audited,
  ParamsQueryAndHeaders
} from '@common/libs';

import { UserDto } from './dtos/user/user.dto';
import { UserCreateDto, UserCreateSchema } from './dtos/request/user-create.dto';
import { UpdateEmailVerificationDto, UpdateEmailVerificationSchema } from './dtos/request/update-email-verification.dto';
import { UserIdRequestDto, UserIdRequestSchema } from './dtos/request/user-id-request.dto';
import { UserCreateResponseDto } from './dtos/response/user-create-response.dto';
import { DeleteUserResponseDto } from './dtos/response/delete-user-response.dto';
import { UserService } from './user.service';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.USER.key)
@ApiBearerAuth('bearer')
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.USER, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class UserAdminController {
  constructor (private readonly userService: UserService) {}

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN] })
  @Audited({ action: 'USER_CREATED', entityType: 'User' })
  @Post()
  async createUser (@Body({ schema: UserCreateSchema }) dto: UserCreateDto): Promise<UserCreateResponseDto> {
    return this.userService.createUser(dto);
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR] })
  @Audited({ action: 'USER_DELETED', entityType: 'User', entityIdParam: 'userId' })
  @Delete(':userId')
  async deleteUser (@ParamsQueryAndHeaders({ schema: UserIdRequestSchema }) dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    return this.userService.deleteUser(dto);
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN] })
  @Audited({ action: 'USER_ANONYMIZED', entityType: 'User', entityIdParam: 'userId' })
  @Post(':userId/anonymize')
  async anonymizeUser (@ParamsQueryAndHeaders({ schema: UserIdRequestSchema }) dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    return this.userService.anonymizeUser(dto);
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN] })
  @Audited({ action: 'USER_DELETED', entityType: 'User', entityIdParam: 'userId' })
  @Delete(':userId/from-db')
  async deleteUserFromDb (@ParamsQueryAndHeaders({ schema: UserIdRequestSchema }) dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    return this.userService.deleteUserFromDb(dto);
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Audited({ action: 'USER_SUSPENDED', entityType: 'User', entityIdParam: 'userId' })
  @Post(':userId/suspend')
  async suspendUser (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: UserIdRequestSchema }) dto: UserIdRequestDto): Promise<UserDto> {
    return this.userService.changeStatus({ ...dto, actorId: req.user.userId, status: UserStatus.SUSPENDED });
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Audited({ action: 'USER_REACTIVATED', entityType: 'User', entityIdParam: 'userId' })
  @Post(':userId/reactivate')
  async reactivateUser (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: UserIdRequestSchema }) dto: UserIdRequestDto): Promise<UserDto> {
    return this.userService.changeStatus({ ...dto, actorId: req.user.userId, status: UserStatus.ACTIVE });
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR] })
  @Patch(':userId/email-verification')
  async updateEmailVerification (@ParamsQueryAndHeaders({ schema: UpdateEmailVerificationSchema }) dto: UpdateEmailVerificationDto): Promise<UserDto> {
    return this.userService.updateEmailVerification(dto);
  }
}

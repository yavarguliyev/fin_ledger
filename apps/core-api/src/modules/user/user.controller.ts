import { Body, Controller, Patch, UseGuards, Req, Post, UploadedFiles, UseInterceptors, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ENVIRONMENT_CONSTANTS,
  SessionGuard,
  RequestContext,
  UploadFile,
  FileUrlsResponse,
  UploadFileResponse,
  Roles,
  UserRoles,
  RolesGuard,
  Audited,
  ParamsQueryAndHeaders
} from '@common/libs';

import { UserService } from './user.service';
import { UserDto } from './dtos/user/user.dto';
import { UserCreateDto, UserCreateSchema } from './dtos/request/user-create.dto';
import { UpdateUserRequestDto, UpdateUserRequestSchema } from './dtos/request/update-user-request.dto';
import { UpdateEmailVerificationDto, UpdateEmailVerificationSchema } from './dtos/request/update-email-verification.dto';
import { UserIdRequestDto, UserIdRequestSchema } from './dtos/request/user-id-request.dto';
import { UserImagesRequestDto, UserImagesRequestSchema } from './dtos/request/user-images-request.dto';
import { UserCreateResponseDto } from './dtos/response/user-create-response.dto';
import { UserUpdateRecordDto } from './dtos/response/user-update-response.dto';
import { DeleteUserResponseDto } from './dtos/response/delete-user-response.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.USER.key)
@ApiBearerAuth('bearer')
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.USER, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class UserController {
  constructor (private readonly userService: UserService) {}

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN] })
  @Audited({ action: 'USER_CREATED', entityType: 'User' })
  @Post()
  async createUser (@Body({ schema: UserCreateSchema }) dto: UserCreateDto): Promise<UserCreateResponseDto> {
    return this.userService.createUser(dto);
  }

  @Patch()
  async updateUser (@Req() req: RequestContext, @Body({ schema: UpdateUserRequestSchema }) dto: UpdateUserRequestDto): Promise<UserUpdateRecordDto> {
    return this.userService.updateUser({ ...dto, userId: req.user.userId });
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles (@Req() req: RequestContext, @UploadedFiles() files: UploadFile[]): Promise<UploadFileResponse> {
    return this.userService.uploadFiles({ userId: req.user.userId, files });
  }

  @Get('images')
  async getImages (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: UserImagesRequestSchema }) dto: UserImagesRequestDto
  ): Promise<FileUrlsResponse> {
    return this.userService.getImages({ ...dto, userId: req.user.userId });
  }

  @Delete('images')
  async deleteImages (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: UserImagesRequestSchema }) dto: UserImagesRequestDto
  ): Promise<void> {
    return this.userService.deleteImages({ ...dto, userId: req.user.userId });
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

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR] })
  @Patch(':userId/email-verification')
  async updateEmailVerification (@ParamsQueryAndHeaders({ schema: UpdateEmailVerificationSchema }) dto: UpdateEmailVerificationDto): Promise<UserDto> {
    return this.userService.updateEmailVerification(dto);
  }
}

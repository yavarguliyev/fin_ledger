import { Body, Controller, Patch, UseGuards, Req, Post, UploadedFiles, UseInterceptors, Get, Query, Delete, Param } from '@nestjs/common';
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
  RolesGuard
} from '@common/libs';

import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update/update-user.dto';
import { UserUpdateResponeDto } from './dtos/update/user-update-response.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';
import { DeleteUserDto, UserDto } from './dtos/user/user.dto';
import { UpdateEmailVerificationDto } from './dtos/update/update-email-verification.dto';
import { UserCreateDto, UserCreateResponse } from './dtos/user/user-create.dto';

@ApiTags(SHARED_CONSTANTS.USER.key)
@ApiBearerAuth('bearer')
@UseGuards(SessionGuard, RolesGuard)
@Roles(UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.USER, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class UserController {
  constructor (private readonly userService: UserService) {}

  @Roles(UserRoles.GLOBAL_ADMIN)
  @Post()
  async createUser (@Body() dto: UserCreateDto): Promise<UserCreateResponse> {
    return this.userService.createUser(dto);
  }

  @Patch()
  async updateUser (@Req() req: RequestContext, @Body() dto: UpdateUserDto): Promise<UserUpdateResponeDto> {
    return this.userService.updateUser(req.user.userId, dto);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles (@Req() req: RequestContext, @UploadedFiles() files: UploadFile[]): Promise<UploadFileResponse> {
    return this.userService.uploadFiles(req.user.userId, files);
  }

  @Get('images')
  async getImages (@Req() req: RequestContext, @Query('indexes') indexes?: string): Promise<FileUrlsResponse> {
    return this.userService.getImages(req.user.userId, indexes);
  }

  @Delete('images')
  async deleteImages (@Req() req: RequestContext, @Query('indexes') indexes?: string): Promise<void> {
    return this.userService.deleteImages(req.user.userId, indexes);
  }

  @Roles(UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR)
  @Delete(':userId')
  async deleteUser (@Param('userId') userId: string): Promise<DeleteUserDto> {
    return this.userService.deleteUser(userId);
  }

  @Roles(UserRoles.GLOBAL_ADMIN)
  @Delete(':userId/from-db')
  async deleteUserFromDb (@Param('userId') userId: string): Promise<DeleteUserDto> {
    return this.userService.deleteUserFromDb(userId);
  }

  @Roles(UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR)
  @Patch(':userId/email-verification')
  async updateEmailVerification (@Param('userId') userId: string, @Body() dto: UpdateEmailVerificationDto): Promise<UserDto> {
    return this.userService.updateEmailVerification(userId, dto.isEmailVerified);
  }
}

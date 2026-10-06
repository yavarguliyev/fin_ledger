import { Body, Controller, Patch, Put, UseGuards, Req, Post, UploadedFiles, UseInterceptors, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ENVIRONMENT_CONSTANTS,
  SessionGuard,
  RequestContext,
  IMAGE_UPLOAD_LIMITS,
  UploadFile,
  FileUrlsResponse,
  Roles,
  UserRoles,
  RolesGuard,
  ParamsQueryAndHeaders
} from '@common/libs';

import { UpdateUserRequestDto, UpdateUserRequestSchema } from '../dtos/request/update-user-request.dto';
import { UserImagesRequestDto, UserImagesRequestSchema } from '../dtos/request/user-images-request.dto';
import { CurrentUserResponseDto } from '../dtos/response/current-user-response.dto';
import { UserService } from '../services/user.service';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { SelfExclusionRequestDto, SelfExclusionRequestSchema } from '../dtos/request/self-exclusion-request.dto';
import { SelfExclusionResponseDto } from '../dtos/response/self-exclusion-response.dto';
import { SetDepositLimitRequestDto, SetDepositLimitRequestSchema } from '../dtos/deposit-limits/set-deposit-limit-request.dto';
import { DepositLimitResponseDto } from '../dtos/deposit-limits/deposit-limit-response.dto';
import { DepositLimitViewDto } from '../dtos/deposit-limits/deposit-limit-view.dto';
import { UploadImagesResponseDto } from '../dtos/storage/upload-images-response.dto';

@ApiTags(SHARED_CONSTANTS.USER.key)
@ApiBearerAuth('bearer')
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.USER, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class UserController {
  constructor (private readonly userService: UserService) {}

  @Get('me/deposit-limits')
  async getDepositLimits (@Req() req: RequestContext): Promise<DepositLimitViewDto[]> {
    return this.userService.getDepositLimits({ userId: req.user.userId });
  }

  @Put('me/deposit-limits')
  async setDepositLimit (
    @Req() req: RequestContext,
    @Body({ schema: SetDepositLimitRequestSchema }) dto: SetDepositLimitRequestDto
  ): Promise<DepositLimitResponseDto> {
    return this.userService.setDepositLimit({ ...dto, userId: req.user.userId });
  }

  @Post('me/self-exclusion')
  async setSelfExclusion (
    @Req() req: RequestContext,
    @Body({ schema: SelfExclusionRequestSchema }) dto: SelfExclusionRequestDto
  ): Promise<SelfExclusionResponseDto> {
    return this.userService.setSelfExclusion({ ...dto, userId: req.user.userId });
  }

  @Get('me')
  async getCurrentUser (@Req() req: RequestContext): Promise<CurrentUserResponseDto> {
    return this.userService.getCurrentUser({ userId: req.user.userId });
  }

  @Patch()
  async updateUser (
    @Req() req: RequestContext,
    @Body({ schema: UpdateUserRequestSchema }) dto: UpdateUserRequestDto
  ): Promise<CurrentUserResponseDto> {
    return this.userService.updateUser({ ...dto, userId: req.user.userId });
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor(IMAGE_UPLOAD_LIMITS.FIELD_NAME, IMAGE_UPLOAD_LIMITS.MAX_FILES, {
      limits: { fileSize: IMAGE_UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES, files: IMAGE_UPLOAD_LIMITS.MAX_FILES }
    })
  )
  async uploadFiles (@Req() req: RequestContext, @UploadedFiles() files: UploadFile[]): Promise<UploadImagesResponseDto> {
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
}

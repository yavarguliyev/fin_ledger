import { Injectable } from '@nestjs/common';
import { FileUrlsResponse } from '@common/libs';

import { GetCurrentUserUseCase } from '../use-cases/queries/get-current-user.use-case';
import { UpdateUserUseCase } from '../use-cases/commands/update-user.use-case';
import { SetSelfExclusionUseCase } from '../use-cases/commands/set-self-exclusion.use-case';
import { SetDepositLimitUseCase } from '../use-cases/commands/set-deposit-limit.use-case';
import { GetDepositLimitsUseCase } from '../use-cases/queries/get-deposit-limits.use-case';
import { UploadFilesUseCase } from '../use-cases/commands/upload-files.use-case';
import { GetImagesUseCase } from '../use-cases/queries/get-images.use-case';
import { DeleteImagesUseCase } from '../use-cases/commands/delete-user-images.use-case';
import { DeleteUserUseCase } from '../use-cases/commands/delete-user.use-case';
import { UpdateEmailVerificationUseCase } from '../use-cases/commands/update-email-verification.use-case';
import { ChangeUserStatusUseCase } from '../use-cases/commands/change-user-status.use-case';
import { ChangeUserStatusDto } from '../dtos/input/change-user-status.dto';
import { UserCreateUseCase } from '../use-cases/commands/user-create.use-case';
import { DeleteUserFromDbUseCase } from '../use-cases/commands/delete-user-from-db.use-case';
import { AnonymizeUserUseCase } from '../use-cases/commands/anonymize-user.use-case';
import { UserDto } from '../dtos/user/user.dto';
import { UserCreateDto } from '../dtos/request/user-create.dto';
import { UserIdRequestDto } from '../dtos/request/user-id-request.dto';
import { UpdateEmailVerificationDto } from '../dtos/request/update-email-verification.dto';
import { UpdateUserDto } from '../dtos/input/update-user.dto';
import { UploadFilesDto } from '../dtos/input/upload-files.dto';
import { UserImagesDto } from '../dtos/input/user-images.dto';
import { UserCreateResponseDto } from '../dtos/response/user-create-response.dto';
import { CurrentUserResponseDto } from '../dtos/response/current-user-response.dto';
import { DeleteUserResponseDto } from '../dtos/response/delete-user-response.dto';
import { SetSelfExclusionDto } from '../dtos/input/set-self-exclusion.dto';
import { SelfExclusionResponseDto } from '../dtos/response/self-exclusion-response.dto';
import { SetDepositLimitDto } from '../dtos/deposit-limits/set-deposit-limit.dto';
import { DepositLimitResponseDto } from '../dtos/deposit-limits/deposit-limit-response.dto';
import { DepositLimitViewDto } from '../dtos/deposit-limits/deposit-limit-view.dto';
import { UploadImagesResponseDto } from '../dtos/storage/upload-images-response.dto';

@Injectable()
export class UserService {
  constructor (
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly setSelfExclusionUseCase: SetSelfExclusionUseCase,
    private readonly setDepositLimitUseCase: SetDepositLimitUseCase,
    private readonly getDepositLimitsUseCase: GetDepositLimitsUseCase,
    private readonly uploadFilesUseCase: UploadFilesUseCase,
    private readonly getImagesUseCase: GetImagesUseCase,
    private readonly deleteImagesUseCase: DeleteImagesUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly deleteUserFromDbUseCase: DeleteUserFromDbUseCase,
    private readonly updateEmailVerificationUseCase: UpdateEmailVerificationUseCase,
    private readonly userCreateUseCase: UserCreateUseCase,
    private readonly anonymizeUserUseCase: AnonymizeUserUseCase,
    private readonly changeUserStatusUseCase: ChangeUserStatusUseCase
  ) {}

  async createUser (dto: UserCreateDto): Promise<UserCreateResponseDto> {
    return this.userCreateUseCase.execute(dto);
  }

  async getCurrentUser (dto: UserIdRequestDto): Promise<CurrentUserResponseDto> {
    return this.getCurrentUserUseCase.execute(dto);
  }

  async updateUser (dto: UpdateUserDto): Promise<CurrentUserResponseDto> {
    return this.updateUserUseCase.execute(dto);
  }

  async setSelfExclusion (dto: SetSelfExclusionDto): Promise<SelfExclusionResponseDto> {
    return this.setSelfExclusionUseCase.execute(dto);
  }

  async setDepositLimit (dto: SetDepositLimitDto): Promise<DepositLimitResponseDto> {
    return this.setDepositLimitUseCase.execute(dto);
  }

  async getDepositLimits (dto: UserIdRequestDto): Promise<DepositLimitViewDto[]> {
    return this.getDepositLimitsUseCase.execute(dto);
  }

  async uploadFiles (dto: UploadFilesDto): Promise<UploadImagesResponseDto> {
    return this.uploadFilesUseCase.execute(dto);
  }

  async changeStatus (dto: ChangeUserStatusDto): Promise<UserDto> {
    return this.changeUserStatusUseCase.execute(dto);
  }

  async updateEmailVerification (dto: UpdateEmailVerificationDto): Promise<UserDto> {
    return this.updateEmailVerificationUseCase.execute(dto);
  }

  async getImages (dto: UserImagesDto): Promise<FileUrlsResponse> {
    return this.getImagesUseCase.execute(dto);
  }

  async deleteImages (dto: UserImagesDto): Promise<void> {
    return this.deleteImagesUseCase.execute(dto);
  }

  async deleteUser (dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    return this.deleteUserUseCase.execute(dto);
  }

  async anonymizeUser (dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    return this.anonymizeUserUseCase.execute(dto);
  }

  async deleteUserFromDb (dto: UserIdRequestDto): Promise<DeleteUserResponseDto> {
    return this.deleteUserFromDbUseCase.execute(dto);
  }
}

import { Injectable } from '@nestjs/common';
import { FileUrlsResponse, UploadFileResponse } from '@common/libs';

import { UpdateUserUseCase } from './use-cases/commands/update-user.use-case';
import { UploadFilesUseCase } from './use-cases/commands/upload-files.use-case';
import { GetImagesUseCase } from './use-cases/queries/get-images.use-case';
import { DeleteImagesUseCase } from './use-cases/commands/delete-user-images.use-case';
import { DeleteUserUseCase } from './use-cases/commands/delete-user.use-case';
import { UpdateEmailVerificationUseCase } from './use-cases/commands/update-email-verification.use-case';
import { UserCreateUseCase } from './use-cases/commands/user-create.use-case';
import { DeleteUserFromDbUseCase } from './use-cases/commands/delete-user-from-db.use-case';
import { AnonymizeUserUseCase } from './use-cases/commands/anonymize-user.use-case';
import { UserDto } from './dtos/user/user.dto';
import { UserCreateDto } from './dtos/request/user-create.dto';
import { UserIdRequestDto } from './dtos/request/user-id-request.dto';
import { UpdateEmailVerificationDto } from './dtos/request/update-email-verification.dto';
import { UpdateUserDto } from './dtos/input/update-user.dto';
import { UploadFilesDto } from './dtos/input/upload-files.dto';
import { UserImagesDto } from './dtos/input/user-images.dto';
import { UserCreateResponseDto } from './dtos/response/user-create-response.dto';
import { UserUpdateRecordDto } from './dtos/response/user-update-response.dto';
import { DeleteUserResponseDto } from './dtos/response/delete-user-response.dto';

@Injectable()
export class UserService {
  constructor (
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly uploadFilesUseCase: UploadFilesUseCase,
    private readonly getImagesUseCase: GetImagesUseCase,
    private readonly deleteImagesUseCase: DeleteImagesUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly deleteUserFromDbUseCase: DeleteUserFromDbUseCase,
    private readonly updateEmailVerificationUseCase: UpdateEmailVerificationUseCase,
    private readonly userCreateUseCase: UserCreateUseCase,
    private readonly anonymizeUserUseCase: AnonymizeUserUseCase
  ) {}

  async createUser (dto: UserCreateDto): Promise<UserCreateResponseDto> {
    return this.userCreateUseCase.execute(dto);
  }

  async updateUser (dto: UpdateUserDto): Promise<UserUpdateRecordDto> {
    return this.updateUserUseCase.execute(dto);
  }

  async uploadFiles (dto: UploadFilesDto): Promise<UploadFileResponse> {
    return this.uploadFilesUseCase.execute(dto);
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

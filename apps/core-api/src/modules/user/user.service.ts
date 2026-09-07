import { Injectable } from '@nestjs/common';
import { FileUrlsResponse, UploadFile, UploadFileResponse } from '@common/libs';

import { UpdateUserUseCase } from './use-cases/commands/update-user.use-case';
import { UploadFilesUseCase } from './use-cases/commands/upload-files.use-case';
import { GetImagesUseCase } from './use-cases/queries/get-images.use-case';
import { DeleteImagesUseCase } from './use-cases/commands/delete-user-images.use-case';
import { DeleteUserUseCase } from './use-cases/commands/delete-user.use-case';
import { UpdateEmailVerificationUseCase } from './use-cases/commands/update-email-verification.use-case';
import { UserCreateUseCase } from './use-cases/commands/user-create.use-case';
import { UpdateUserDto } from './dtos/update/update-user.dto';
import { UserUpdateResponeDto } from './dtos/update/user-update-response.dto';
import { DeleteUserDto, UserDto } from './dtos/user/user.dto';
import { UserCreateDto, UserCreateResponse } from './dtos/user/user-create.dto';
import { DeleteUserFromDbUseCase } from './use-cases/commands/delete-user-from-db.use-case';

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
    private readonly userCreateUseCase: UserCreateUseCase
  ) {}

  async createUser (dto: UserCreateDto): Promise<UserCreateResponse> {
    return this.userCreateUseCase.execute(dto);
  }

  async updateUser (id: string, dto: UpdateUserDto): Promise<UserUpdateResponeDto> {
    return this.updateUserUseCase.execute({ userId: id, dto });
  }

  async uploadFiles (userId: string, files: UploadFile[]): Promise<UploadFileResponse> {
    return this.uploadFilesUseCase.execute({ userId, files });
  }

  async updateEmailVerification (userId: string, isEmailVerified: boolean): Promise<UserDto> {
    return this.updateEmailVerificationUseCase.execute({ userId, isEmailVerified });
  }

  async getImages (userId: string, indexes?: string): Promise<FileUrlsResponse> {
    return this.getImagesUseCase.execute({ userId, indexes: indexes ? indexes.split(',').map(Number) : undefined });
  }

  async deleteImages (userId: string, indexes?: string): Promise<void> {
    return this.deleteImagesUseCase.execute({ userId, indexes: indexes ? indexes.split(',').map(Number) : undefined });
  }

  async deleteUser (userId: string): Promise<DeleteUserDto> {
    return this.deleteUserUseCase.execute(userId);
  }

  async deleteUserFromDb (userId: string): Promise<DeleteUserDto> {
    return this.deleteUserFromDbUseCase.execute(userId);
  }
}

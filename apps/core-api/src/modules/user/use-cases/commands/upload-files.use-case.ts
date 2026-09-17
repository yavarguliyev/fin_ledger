import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService, UploadFileResponse, StorageHelper } from '@common/libs';

import { UserRepository } from '../../repositories/user.repository';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserUpload } from '../../dtos/update/update-user.dto';

@Injectable()
export class UploadFilesUseCase extends UserBaseCase<UserUpload, UploadFileResponse> {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly storage: StorageService
  ) {
    super();
  }

  async execute ({ userId, files }: UserUpload): Promise<UploadFileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const processedFiles = await Promise.all(
      files.map(async file => {
        if (this.webCompatibleFormats.includes(file.mimetype)) return file;
        return StorageHelper.convertToWebFormat({ file });
      })
    );

    return this.storage.uploadFiles({ key: `user-${userId}`, files: processedFiles });
  }
}

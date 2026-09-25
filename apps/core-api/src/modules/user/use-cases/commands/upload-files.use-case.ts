import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadFileResponse, StorageHelper } from '@common/libs';

import { UploadFilesDto } from '../../dtos/input/upload-files.dto';
import { UserBaseCase } from '../base/user-base.use-case';

@Injectable()
export class UploadFilesUseCase extends UserBaseCase<UploadFilesDto, UploadFileResponse> {
  async execute ({ userId, files }: UploadFilesDto): Promise<UploadFileResponse> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    const processedFiles = await Promise.all(files.map(file => StorageHelper.normalizeImage({ file })));
    return this.storageService.uploadFiles({ key: `user-${userId}`, files: processedFiles });
  }
}

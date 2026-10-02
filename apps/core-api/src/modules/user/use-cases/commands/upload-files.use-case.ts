import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { StorageHelper } from '@common/libs';

import { UploadFilesDto } from '../../dtos/input/upload-files.dto';
import { UploadImagesResponseDto } from '../../dtos/storage/upload-images-response.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserStorageHelper } from '../../helpers/user-storage.helper';
import { ImageBatchHelper } from '../../helpers/image-batch.helper';

@Injectable()
export class UploadFilesUseCase extends UserBaseCase<UploadFilesDto, UploadImagesResponseDto> {
  async execute ({ userId, files }: UploadFilesDto): Promise<UploadImagesResponseDto> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const results = await Promise.allSettled(files.map(file => StorageHelper.normalizeImage({ file })));
    const { accepted, rejected, status } = ImageBatchHelper.split({ files, results });
    if (accepted.length === 0) throw new HttpException(ImageBatchHelper.summary({ rejected }), status);

    const uploaded = await this.storageService.uploadFiles({ key: UserStorageHelper.profileImagesKey({ userId }), files: accepted });
    return { ...uploaded, rejected };
  }
}

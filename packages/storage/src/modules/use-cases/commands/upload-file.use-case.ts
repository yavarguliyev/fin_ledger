import { BadRequestException, Injectable } from '@nestjs/common';
import { v7 as uuid } from 'uuid';
import { StorageType } from '@common/shared-libs';

import { BaseStrategy } from '../../strategies/base/base.strategy';
import { StorageBaseUseCase } from '../base/storage-base.use-case';
import { UploadFileResponse, UploadFilesRequest } from '../../interfaces/storage.interface';

@Injectable()
export class UploadFileUseCase extends StorageBaseUseCase {
  protected readonly storageType: StorageType = StorageType.UPLOAD;

  constructor (protected override readonly storageStrategy: BaseStrategy) {
    super(storageStrategy);
  }

  async execute (dto: UploadFilesRequest): Promise<UploadFileResponse> {
    if (!dto || !dto.files || dto.files.length === 0) throw new BadRequestException('At least one file is required');
    if (!dto.key) throw new BadRequestException('Key is required');

    const uploadedFiles: string[] = [];

    for (const file of dto.files) {
      const extension = this.getFileExtension(file.originalname);
      const filePath = `${dto.key}/${uuid()}${extension}`;
      await this.storageStrategy.upload(filePath, file.buffer, file.mimetype);
      uploadedFiles.push(filePath);
    }

    return { key: dto.key, files: uploadedFiles };
  }
}

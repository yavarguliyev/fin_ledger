import { BadRequestException, Injectable } from '@nestjs/common';
import { v7 as uuid } from 'uuid';
import { StorageType } from '@common/shared-libs';

import { StorageBaseUseCase } from '../base/storage-base.use-case';
import { UploadFileResponse } from '../../interfaces/upload-file-response.interface';
import { UploadFilesDto } from '../../dtos/service/upload-files.dto';

@Injectable()
export class UploadFileUseCase extends StorageBaseUseCase {
  protected readonly storageType: StorageType = StorageType.UPLOAD;

  async execute (dto: UploadFilesDto): Promise<UploadFileResponse> {
    if (!dto || !dto.files || dto.files.length === 0) throw new BadRequestException('At least one file is required');
    if (!dto.key) throw new BadRequestException('Key is required');

    const uploadedFiles: string[] = [];

    for (const file of dto.files) {
      const extension = this.getFileExtension({ filename: file.originalname });
      const filePath = `${dto.key}/${uuid()}${extension}`;
      await this.storageStrategy.upload({ key: filePath, body: file.buffer, contentType: file.mimetype });
      uploadedFiles.push(filePath);
    }

    return { key: dto.key, files: uploadedFiles };
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';
import { UploadFile } from '@common/libs';

import { USER_STORAGE } from '../constants/storage/user-storage.constant';
import { ImageBatchDto } from '../dtos/helper/image-batch.dto';
import { RejectedFilesDto } from '../dtos/helper/rejected-files.dto';
import { SplitImagesDto } from '../dtos/helper/split-images.dto';
import { RejectedFileDto } from '../dtos/storage/rejected-file.dto';

export class ImageBatchHelper {
  static split ({ files, results }: ImageBatchDto): SplitImagesDto {
    const accepted: UploadFile[] = [];
    const rejected: RejectedFileDto[] = [];
    let status: number = HttpStatus.BAD_REQUEST;

    results.forEach((result, index) => {
      if (result.status === USER_STORAGE.FULFILLED) {
        accepted.push(result.value);
        return;
      }

      const reason: unknown = result.reason;
      if (reason instanceof HttpException && rejected.length === 0) status = reason.getStatus();
      rejected.push({ fileName: files[index]?.originalname ?? USER_STORAGE.UNKNOWN_FILE, reason: reason instanceof Error ? reason.message : USER_STORAGE.UNREADABLE_IMAGE });
    });

    return { accepted, rejected, status };
  }

  static summary ({ rejected }: RejectedFilesDto): string {
    return rejected.map(({ fileName, reason }) => `${fileName}${USER_STORAGE.NAME_SEPARATOR}${reason}`).join(USER_STORAGE.REJECTION_SEPARATOR);
  }
}

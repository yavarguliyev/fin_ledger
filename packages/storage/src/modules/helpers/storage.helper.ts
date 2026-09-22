import { BadRequestException, UnsupportedMediaTypeException } from '@nestjs/common';
import sharp from 'sharp';

import { UploadFile } from '../interfaces/upload-file.interface';
import { NormalizeImageDto } from '../dtos/helper/normalize-image.dto';
import { IMAGE_FORMATS } from '../constants/image/image-formats.constant';
import { IMAGE_UPLOAD_LIMITS } from '../constants/image/image-upload-limits.constant';
import { STORAGE_ERRORS } from '../constants/errors/storage-errors.constant';

export class StorageHelper {
  static async normalizeImage ({ file }: NormalizeImageDto): Promise<UploadFile> {
    const { format, width = 0, height = 0 } = await sharp(file.buffer, { limitInputPixels: false })
      .metadata()
      .catch(() => {
        throw new UnsupportedMediaTypeException(STORAGE_ERRORS.UNSUPPORTED_IMAGE);
      });

    if (!format || !(format in IMAGE_FORMATS.OUTPUT_BY_INPUT)) throw new UnsupportedMediaTypeException(STORAGE_ERRORS.UNSUPPORTED_IMAGE);
    if (width * height > IMAGE_UPLOAD_LIMITS.MAX_INPUT_PIXELS) throw new BadRequestException(STORAGE_ERRORS.IMAGE_TOO_LARGE);

    const output = IMAGE_FORMATS.OUTPUT_BY_INPUT[format as keyof typeof IMAGE_FORMATS.OUTPUT_BY_INPUT];

    const buffer = await sharp(file.buffer, { limitInputPixels: IMAGE_UPLOAD_LIMITS.MAX_INPUT_PIXELS })
      .rotate()
      .toFormat(output)
      .toBuffer()
      .catch(() => {
        throw new BadRequestException(STORAGE_ERRORS.UNPROCESSABLE_IMAGE);
      });

    return {
      buffer,
      mimetype: IMAGE_FORMATS.MIME_TYPES[output],
      originalname: file.originalname.replace(IMAGE_FORMATS.EXTENSION_PATTERN, '') + IMAGE_FORMATS.EXTENSIONS[output]
    };
  }
}

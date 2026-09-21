import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

import { UploadFile } from '../interfaces/upload-file.interface';
import { ConvertToWebFormatDto } from '../dtos/helper/convert-to-web-format.dto';

export class StorageHelper {
  static async convertToWebFormat ({ file }: ConvertToWebFormatDto): Promise<UploadFile> {
    try {
      const convertedBuffer = await sharp(file.buffer).png().toBuffer();
      const originalName = file.originalname.replace(/\.[^.]+$/, '.png');

      return { buffer: convertedBuffer, mimetype: 'image/png', originalname: originalName };
    } catch {
      throw new BadRequestException(`Failed to process image: ${file.originalname}`);
    }
  }
}

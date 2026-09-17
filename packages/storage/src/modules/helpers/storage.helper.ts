import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

import { UploadFile } from '../interfaces/storage.interface';
import { ConvertToWebFormatParams } from '../dto/storage.dto';

export class StorageHelper {
  public static async convertToWebFormat (params: ConvertToWebFormatParams): Promise<UploadFile> {
    const { file } = params;

    try {
      const convertedBuffer = await sharp(file.buffer).png().toBuffer();
      const originalName = file.originalname.replace(/\.[^.]+$/, '.png');

      return { buffer: convertedBuffer, mimetype: 'image/png', originalname: originalName };
    } catch {
      throw new BadRequestException(`Failed to process image: ${file.originalname}`);
    }
  }
}

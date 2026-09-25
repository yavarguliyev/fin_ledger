import { BadRequestException, UnsupportedMediaTypeException } from '@nestjs/common';
import sharp from 'sharp';

import { StorageHelper } from '../src/modules/helpers/storage.helper';
import { IMAGE_FORMATS } from '../src/modules/constants/image/image-formats.constant';

const image = (format: 'jpeg' | 'png' | 'tiff', size = 8): Promise<Buffer> =>
  sharp({ create: { width: size, height: size, channels: 3, background: { r: 200, g: 100, b: 50 } } })
    .toFormat(format)
    .toBuffer();

describe('StorageHelper.normalizeImage', () => {
  it('keeps a web format and takes the type from the bytes, not the client', async () => {
    const file = { buffer: await image('jpeg'), mimetype: 'application/octet-stream', originalname: 'avatar.bin' };
    const result = await StorageHelper.normalizeImage({ file });

    expect(result.mimetype).toBe(IMAGE_FORMATS.MIME_TYPES.jpeg);
    expect(result.originalname).toBe(`avatar${IMAGE_FORMATS.EXTENSIONS.jpeg}`);

    await expect(sharp(result.buffer).metadata()).resolves.toMatchObject({ format: 'jpeg' });
  });

  it('converts other image formats to PNG', async () => {
    const result = await StorageHelper.normalizeImage({ file: { buffer: await image('tiff'), mimetype: 'image/tiff', originalname: 'scan.tiff' } });

    expect(result.mimetype).toBe(IMAGE_FORMATS.MIME_TYPES.png);
    expect(result.originalname).toBe(`scan${IMAGE_FORMATS.EXTENSIONS.png}`);
  });

  it('strips EXIF metadata such as GPS location', async () => {
    const withExif = await sharp(await image('jpeg'))
      .withExif({ IFD0: { Copyright: 'secret-location' } })
      .jpeg()
      .toBuffer();

    const result = await StorageHelper.normalizeImage({ file: { buffer: withExif, mimetype: 'image/jpeg', originalname: 'photo.jpg' } });

    const { exif } = await sharp(result.buffer).metadata();
    expect(exif).toBeUndefined();
  });

  it('rejects a text file that claims to be a PNG', async () => {
    const file = { buffer: Buffer.from('this is not an image'), mimetype: 'image/png', originalname: 'fake.png' };
    await expect(StorageHelper.normalizeImage({ file })).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
  });

  it('rejects an image with too many pixels before decoding it', async () => {
    const huge = await sharp({ create: { width: 8000, height: 6000, channels: 3, background: { r: 0, g: 0, b: 0 } } })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await expect(StorageHelper.normalizeImage({ file: { buffer: huge, mimetype: 'image/png', originalname: 'bomb.png' } })).rejects.toBeInstanceOf(
      BadRequestException
    );
  });
});

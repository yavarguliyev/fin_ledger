import sharp from 'sharp';
import { crc32 } from 'node:zlib';

import { OVERSIZED_PNG as P } from '../constants/oversized-png.constant';

export class OversizedPngFixture {
  static async build (): Promise<Buffer> {
    const png = await sharp({ create: { width: P.SEED_SIZE, height: P.SEED_SIZE, channels: P.CHANNELS, background: P.BACKGROUND } })
      .png()
      .toBuffer();

    png.writeUInt32BE(P.WIDTH, P.WIDTH_OFFSET);
    png.writeUInt32BE(P.HEIGHT, P.HEIGHT_OFFSET);
    png.writeUInt32BE(crc32(png.subarray(P.CRC_START, P.CRC_OFFSET)), P.CRC_OFFSET);

    return png;
  }
}

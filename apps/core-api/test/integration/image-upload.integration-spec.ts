import { IMAGE_UPLOAD_LIMITS } from '@common/storage';

import { IMAGE_UPLOAD_TEST as T } from '../constants/image-upload.constant';
import { ApiHelper } from '../helpers/api.helper';
import { ImageUploadHelper } from '../helpers/image-upload.helper';
import { ImageParts } from '../interfaces/image-upload.interface';

describe('Image upload limits', () => {
  let token: string;

  beforeAll(async () => {
    token = await ApiHelper.login({ email: T.EMAIL });
  });

  const upload = ({ parts }: ImageParts): Promise<Response> => ImageUploadHelper.send({ parts, token });

  it('rejects a file over the size limit with 413', async () => {
    const oversized = Buffer.alloc(IMAGE_UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES + T.OVER_LIMIT);
    const response = await upload({ parts: [{ content: oversized, name: T.BIG_NAME, type: T.PNG_TYPE }] });
    expect(response.status).toBe(T.PAYLOAD_TOO_LARGE);
  });

  it('rejects more files than allowed with 400', async () => {
    const parts = Array.from({ length: IMAGE_UPLOAD_LIMITS.MAX_FILES + T.OVER_LIMIT }, (_, index) => ({
      content: Buffer.from(T.FILLER),
      name: `${T.NAME_PREFIX}${index}${T.PNG_SUFFIX}`,
      type: T.PNG_TYPE
    }));

    expect((await upload({ parts })).status).toBe(T.BAD_REQUEST);
  });

  it('rejects a text file that claims to be a PNG with 415', async () => {
    const response = await upload({ parts: [{ content: Buffer.from(T.FAKE_TEXT), name: T.FAKE_NAME, type: T.PNG_TYPE }] });
    expect(response.status).toBe(T.UNSUPPORTED);
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IMAGE_BATCH_TEST as T } from '../constants/image-batch.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { ImageUploadHelper } from '../helpers/image-upload.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { ImageBatchResult, ImagePart, ImageParts } from '../interfaces/image-upload.interface';

const png: ImagePart = { content: Buffer.from(T.PNG_BASE64, T.BASE64), name: T.PNG_NAME, type: T.PNG_TYPE };
const raw: ImagePart = { content: Buffer.from(T.FAKE_BYTES), name: T.RAW_NAME, type: T.RAW_TYPE };
const heic: ImagePart = { content: Buffer.from(T.FAKE_BYTES), name: T.HEIC_NAME, type: T.HEIC_TYPE };
const realHeic: ImagePart = { content: readFileSync(join(__dirname, T.REAL_HEIC_FIXTURE)), name: T.REAL_HEIC_NAME, type: T.HEIC_TYPE };

describe('Uploading a mixed batch of images', () => {
  let token = '';

  const upload = async ({ parts }: ImageParts): Promise<ImageBatchResult> => {
    const response = await ImageUploadHelper.send({ parts, token });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  };

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.EMAIL] });
    token = await ApiHelper.login({ email: T.EMAIL });
  });

  afterAll(async () => DbHelper.close());

  it('uploads the good images and names each rejected file with the reason', async () => {
    const { status, body } = await upload({ parts: [png, raw] });

    expect(status).toBe(T.CREATED);
    expect(body[T.FILES_KEY]).toHaveLength(1);
    expect(body[T.REJECTED_KEY]).toEqual([{ fileName: T.RAW_NAME, reason: expect.stringContaining(T.HINT) as string }]);
  });

  it('accepts an iPhone HEIC photo and stores it as JPEG', async () => {
    const { status, body } = await upload({ parts: [realHeic] });

    expect(status).toBe(T.CREATED);
    expect(body[T.REJECTED_KEY]).toEqual([]);
    expect((body[T.FILES_KEY] as string[])[0]?.endsWith(T.JPEG_SUFFIX)).toBe(true);
  });

  it('fails only when every image is rejected, listing every file', async () => {
    const { status, body } = await upload({ parts: [raw, heic] });
    const message = (body[T.ERROR_KEY] as { message: string }).message;

    expect(status).toBe(T.UNSUPPORTED);
    expect(message).toContain(T.RAW_NAME);
    expect(message).toContain(T.HEIC_NAME);
  });
});

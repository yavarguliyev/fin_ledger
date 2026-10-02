import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IMAGE_UPLOAD_LIMITS } from '@common/storage';

import { IMAGE_BATCH_TEST as T } from '../constants/image-batch.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

interface Part {
  content: Buffer;
  name: string;
  type: string;
}

const png: Part = { content: Buffer.from(T.PNG_BASE64, T.BASE64), name: T.PNG_NAME, type: T.PNG_TYPE };
const raw: Part = { content: Buffer.from(T.FAKE_BYTES), name: T.RAW_NAME, type: T.RAW_TYPE };
const heic: Part = { content: Buffer.from(T.FAKE_BYTES), name: T.HEIC_NAME, type: T.HEIC_TYPE };
const realHeic: Part = { content: readFileSync(join(__dirname, T.REAL_HEIC_FIXTURE)), name: T.REAL_HEIC_NAME, type: T.HEIC_TYPE };

describe('Uploading a mixed batch of images', () => {
  let token = '';

  const upload = async (parts: Part[]): Promise<{ status: number; body: Record<string, unknown> }> => {
    const form = new FormData();
    parts.forEach(({ content, name, type }) => form.append(IMAGE_UPLOAD_LIMITS.FIELD_NAME, new Blob([new Uint8Array(content)], { type }), name));
    const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.PATH}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'X-Forwarded-For': ApiHelper.randomIp() },
      body: form
    });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  };

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.EMAIL] });
    token = await ApiHelper.login({ email: T.EMAIL });
  });

  afterAll(async () => DbHelper.close());

  it('uploads the good images and names each rejected file with the reason', async () => {
    const { status, body } = await upload([png, raw]);

    expect(status).toBe(T.CREATED);
    expect(body['files']).toHaveLength(1);
    expect(body['rejected']).toEqual([{ fileName: T.RAW_NAME, reason: expect.stringContaining(T.HINT) as string }]);
  });

  it('accepts an iPhone HEIC photo and stores it as JPEG', async () => {
    const { status, body } = await upload([realHeic]);

    expect(status).toBe(T.CREATED);
    expect(body['rejected']).toEqual([]);
    expect((body['files'] as string[])[0]?.endsWith(T.JPEG_SUFFIX)).toBe(true);
  });

  it('fails only when every image is rejected, listing every file', async () => {
    const { status, body } = await upload([raw, heic]);
    const message = (body['error'] as { message: string }).message;

    expect(status).toBe(T.UNSUPPORTED);
    expect(message).toContain(T.RAW_NAME);
    expect(message).toContain(T.HEIC_NAME);
  });
});

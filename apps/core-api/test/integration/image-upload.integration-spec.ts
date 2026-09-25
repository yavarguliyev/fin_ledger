import { IMAGE_UPLOAD_LIMITS } from '@common/storage';

import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';

describe('Image upload limits', () => {
  let token: string;

  beforeAll(async () => {
    token = await ApiHelper.login({ email: 'player22@seed.local' });
  });

  const upload = (files: Array<{ content: Buffer; name: string; type: string }>): Promise<Response> => {
    const form = new FormData();

    files.forEach(({ content, name, type }) => form.append(IMAGE_UPLOAD_LIMITS.FIELD_NAME, new Blob([new Uint8Array(content)], { type }), name));

    return fetch(`${process.env[TEST_ENV_KEYS.API_URL]}/users/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'X-Forwarded-For': ApiHelper.randomIp() },
      body: form
    });
  };

  it('rejects a file over the size limit with 413', async () => {
    const response = await upload([{ content: Buffer.alloc(IMAGE_UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES + 1), name: 'big.png', type: 'image/png' }]);
    expect(response.status).toBe(413);
  });

  it('rejects more files than allowed with 400', async () => {
    const files = Array.from({ length: IMAGE_UPLOAD_LIMITS.MAX_FILES + 1 }, (_, index) => ({
      content: Buffer.from('x'),
      name: `f${index}.png`,
      type: 'image/png'
    }));

    expect((await upload(files)).status).toBe(400);
  });

  it('rejects a text file that claims to be a PNG with 415', async () => {
    const response = await upload([{ content: Buffer.from('this is not an image'), name: 'fake.png', type: 'image/png' }]);
    expect(response.status).toBe(415);
  });
});

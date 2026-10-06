import { IMAGE_UPLOAD_LIMITS } from '@common/storage';

import { IMAGE_UPLOAD_TEST as T } from '../constants/image-upload.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ImageUpload } from '../interfaces/image-upload.interface';
import { ApiHelper } from './api.helper';

export class ImageUploadHelper {
  static send ({ parts, token }: ImageUpload): Promise<Response> {
    const form = new FormData();
    parts.forEach(({ content, name, type }) => form.append(IMAGE_UPLOAD_LIMITS.FIELD_NAME, new Blob([new Uint8Array(content)], { type }), name));

    return fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.PATH}`, {
      method: T.POST,
      headers: { [T.AUTHORIZATION]: `${T.BEARER}${token}`, [T.FORWARDED_FOR]: ApiHelper.randomIp() },
      body: form
    });
  }
}

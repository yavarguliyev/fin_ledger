import { HTTP_STATUS } from './http-status.constant';

export const IMAGE_BATCH_TEST = {
  ...HTTP_STATUS,
  EMAIL: 'image-batch@support-tests.realtime-wallet-payments.com',
  PATH: '/users/upload',
  PNG_BASE64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  PNG_NAME: 'photo.png',
  PNG_TYPE: 'image/png',
  RAW_NAME: 'IMG_7371.dng',
  RAW_TYPE: 'image/x-adobe-dng',
  HEIC_NAME: 'IMG_7372.HEIC',
  HEIC_TYPE: 'image/heic',
  FAKE_BYTES: 'not really an image',
  HINT: 'RAW (DNG)',
  REAL_HEIC_FIXTURE: '../fixtures/sample.heic',
  REAL_HEIC_NAME: 'IMG_0420.HEIC',
  JPEG_SUFFIX: '.jpg',
  UNSUPPORTED: 415,
  BASE64: 'base64'
} as const;

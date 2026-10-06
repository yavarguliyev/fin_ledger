import { HTTP_STATUS } from './http-status.constant';

export const IMAGE_UPLOAD_TEST = {
  ...HTTP_STATUS,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED: 415,
  PATH: '/users/upload',
  POST: 'POST',
  BEARER: 'Bearer ',
  AUTHORIZATION: 'Authorization',
  FORWARDED_FOR: 'X-Forwarded-For',
  EMAIL: 'player22@realtime-wallet-payments.com',
  PNG_TYPE: 'image/png',
  BIG_NAME: 'big.png',
  FILLER: 'x',
  NAME_PREFIX: 'f',
  PNG_SUFFIX: '.png',
  OVER_LIMIT: 1,
  FAKE_TEXT: 'this is not an image',
  FAKE_NAME: 'fake.png'
} as const;

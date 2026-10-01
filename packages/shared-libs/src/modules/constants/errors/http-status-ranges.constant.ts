import { HttpStatus } from '@nestjs/common';

export const HTTP_STATUS_RANGES: { readonly CLIENT_ERROR_MIN: number; readonly SERVER_ERROR_MIN: number; readonly UNAVAILABLE: number } = {
  CLIENT_ERROR_MIN: HttpStatus.BAD_REQUEST,
  SERVER_ERROR_MIN: HttpStatus.INTERNAL_SERVER_ERROR,
  UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE
};

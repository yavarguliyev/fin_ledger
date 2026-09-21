import { TranslationCode, HttpStatus } from '@common/shared-libs';

export interface Translation {
  code: TranslationCode;
  status: HttpStatus;
  message: string;
}

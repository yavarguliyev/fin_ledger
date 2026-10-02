import { InternalServerErrorException } from '@nestjs/common';
import { CRYPTO_DEFAULTS, CryptoHelper, SendEmailDto } from '@common/libs';

import { EMAIL_LINK } from '../constants/link/email-link.constant';
import { EmailKeySourceDto } from '../dtos/link/email-key-source.dto';
import { OpenEmailDto } from '../dtos/link/open-email.dto';
import { SealEmailDto } from '../dtos/link/seal-email.dto';
import { SealedEmailDto } from '../dtos/link/sealed-email.dto';

export class EmailLinkHelper {
  static keyFrom ({ configService }: EmailKeySourceDto): Buffer {
    const key = Buffer.from(configService.get<string>(EMAIL_LINK.KEY_NAME) ?? '', EMAIL_LINK.KEY_ENCODING);
    if (key.length !== CRYPTO_DEFAULTS.CIPHER_KEY_BYTES) throw new InternalServerErrorException(EMAIL_LINK.KEY_ERROR);
    return key;
  }

  static seal ({ payload, key }: SealEmailDto): SealedEmailDto {
    const { url, ...rest } = payload;
    const encrypted = CryptoHelper.encrypt({ plaintext: url, key }).toString(EMAIL_LINK.SEALED_ENCODING);
    return { ...rest, sealedUrl: `${EMAIL_LINK.SEALED_PREFIX}${encrypted}` };
  }

  static open ({ payload, key }: OpenEmailDto): SendEmailDto {
    const { sealedUrl, url, ...rest } = payload;
    if (!sealedUrl) return { ...rest, url: url ?? EMAIL_LINK.NO_URL };

    const encrypted = Buffer.from(sealedUrl.slice(EMAIL_LINK.SEALED_PREFIX.length), EMAIL_LINK.SEALED_ENCODING);
    return { ...rest, url: CryptoHelper.decrypt({ encrypted, key }) };
  }
}

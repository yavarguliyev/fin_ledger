import type { CookieOptions } from 'express';

import { REFRESH_COOKIE } from '../constants/refresh-cookie.constant';
import { ReadCookieDto } from '../dtos/helper/read-cookie.dto';
import { CookieOptionsDto } from '../dtos/helper/cookie-options.dto';

export class CookieHelper {
  static read ({ header, name }: ReadCookieDto): string | undefined {
    if (!header) return undefined;

    for (const pair of header.split(REFRESH_COOKIE.PAIR_SEPARATOR)) {
      const separator = pair.indexOf(REFRESH_COOKIE.VALUE_SEPARATOR);
      if (separator <= 0) continue;
      if (pair.slice(0, separator).trim() === name) return decodeURIComponent(pair.slice(separator + 1).trim());
    }

    return undefined;
  }

  static options ({ secure }: CookieOptionsDto): CookieOptions {
    return { httpOnly: true, secure, sameSite: REFRESH_COOKIE.SAME_SITE, path: REFRESH_COOKIE.PATH, maxAge: REFRESH_COOKIE.MAX_AGE_MS };
  }
}

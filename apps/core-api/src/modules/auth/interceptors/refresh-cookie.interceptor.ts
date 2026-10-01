import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, map } from 'rxjs';
import type { Request } from 'express';
import { Environment } from '@common/libs';

import { REFRESH_COOKIE } from '../constants/refresh-cookie.constant';
import { CookieHelper } from '../helpers/cookie.helper';
import { CookieRequestDto } from '../dtos/interceptor/cookie-request.dto';
import { CookieResponseDto } from '../dtos/interceptor/cookie-response.dto';
import { MoveRefreshCookieDto } from '../dtos/interceptor/move-refresh-cookie.dto';

@Injectable()
export class RefreshCookieInterceptor implements NestInterceptor {
  constructor (private readonly configService: ConfigService) {}

  intercept (context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<CookieResponseDto['response']>();

    this.adoptCookie({ request });

    return next.handle().pipe(
      map(body => {
        if (this.isRevoking({ request })) return this.clear({ response, body });
        return this.moveToCookie({ response, body });
      })
    );
  }

  private isRevoking ({ request }: CookieRequestDto): boolean {
    return REFRESH_COOKIE.REVOKING_PATHS.some(path => request.path.endsWith(`/${path}`));
  }

  private isSecure (): boolean {
    return this.configService.get<Environment>('NODE_ENV') === Environment.Production;
  }

  private clear ({ response, body }: MoveRefreshCookieDto): unknown {
    response.cookie(REFRESH_COOKIE.NAME, REFRESH_COOKIE.CLEARED_VALUE, {
      ...CookieHelper.options({ secure: this.isSecure() }),
      maxAge: REFRESH_COOKIE.CLEARED_MAX_AGE_MS
    });

    return body;
  }

  private adoptCookie ({ request }: CookieRequestDto): void {
    const body = request.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object' || body[REFRESH_COOKIE.TOKEN_FIELD]) return;

    const cookie = CookieHelper.read({ header: request.headers.cookie, name: REFRESH_COOKIE.NAME });
    if (cookie) body[REFRESH_COOKIE.TOKEN_FIELD] = cookie;
  }

  private moveToCookie ({ response, body }: MoveRefreshCookieDto): unknown {
    const payload = body as Record<string, unknown> | null;
    const token = payload?.[REFRESH_COOKIE.TOKEN_FIELD];
    if (typeof token !== 'string') return body;

    response.cookie(REFRESH_COOKIE.NAME, token, CookieHelper.options({ secure: this.isSecure() }));

    const stripped = { ...payload };
    delete stripped[REFRESH_COOKIE.TOKEN_FIELD];

    return stripped;
  }
}

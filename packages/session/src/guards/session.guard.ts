import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';

import { SessionService } from '../services/session.service';
import { ExpressReqFields, RequestContext } from '../interfaces/session.interface';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor (private readonly sessionService: SessionService) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestContext>();
    const token = this.extractToken(request);
    const session = await this.sessionService.getSession(token);

    if (!session) throw new UnauthorizedException('Invalid or expired session');
    if (!session.isEmailVerified) throw new UnauthorizedException('Please verify your email before accessing this resource');
    if (session.deletedAt !== null && session.deletedAt !== undefined) throw new UnauthorizedException('Your account has been deleted');

    request.user = session;

    return true;
  }

  private extractToken (request: RequestContext): string {
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) return token;
    }

    const queryToken = request.query?.['token'];
    if (typeof queryToken === 'string' && queryToken) return queryToken;

    const expressReq = request as unknown as ExpressReqFields;
    const url = expressReq.url;

    if (typeof url === 'string' && url.includes('?')) {
      const queryString = url.split('?')[1];

      if (queryString) {
        const urlParams = new URLSearchParams(queryString);
        const urlToken = urlParams.get('token');

        if (urlToken) return urlToken;
      }
    }

    throw new UnauthorizedException('Missing or invalid Authorization header');
  }
}

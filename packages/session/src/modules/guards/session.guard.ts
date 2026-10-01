import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RequestScope, UserStatus } from '@common/shared-libs';

import { SessionService } from '../services/session.service';
import { RequestContext } from '../interfaces/request-context.interface';
import { RequestRefDto } from '../dtos/guard/request-ref.dto';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor (private readonly sessionService: SessionService) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestContext>();
    const token = this.extractToken({ request });
    const session = await this.sessionService.getSession({ token });

    if (!session) throw new UnauthorizedException('Invalid or expired session');
    if (!session.isEmailVerified) throw new UnauthorizedException('Please verify your email before accessing this resource');
    if (session.deletedAt !== null && session.deletedAt !== undefined) throw new UnauthorizedException('Your account has been deleted');
    if (session.status !== UserStatus.ACTIVE) throw new UnauthorizedException('Your account is not active');

    request.user = session;

    const scope = RequestScope.current();
    if (scope) scope.actorId = session.userId;

    return true;
  }

  private extractToken ({ request }: RequestRefDto): string {
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) return token;
    }

    throw new UnauthorizedException('Missing or invalid Authorization header');
  }
}

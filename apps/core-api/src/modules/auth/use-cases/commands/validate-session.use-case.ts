import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionData } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';

@Injectable()
export class ValidateSessionUseCase extends AuthBaseUseCase<string, SessionData> {
  async execute (authorization?: string): Promise<SessionData> {
    const session = await this.sessionService.getSession(this.extractBearerToken(authorization));
    if (!session) throw new UnauthorizedException('Invalid or expired session');
    return session;
  }
}

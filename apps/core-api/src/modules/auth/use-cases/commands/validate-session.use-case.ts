import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionData } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthorizationDto } from '../../dtos/request/authorization.dto';

@Injectable()
export class ValidateSessionUseCase extends AuthBaseUseCase<AuthorizationDto, SessionData> {
  async execute ({ authorization }: AuthorizationDto): Promise<SessionData> {
    const session = await this.sessionService.getSession({ token: this.extractBearerToken(authorization) });
    if (!session) throw new UnauthorizedException('Invalid or expired session');
    return session;
  }
}

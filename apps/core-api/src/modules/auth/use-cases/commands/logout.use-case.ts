import { Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { LeavePresenceUseCase } from '../../../support/use-cases/commands/presence/leave-presence.use-case';
import { LogoutSessionDto } from '../../dtos/input/logout-session.dto';

@Injectable()
export class LogoutUseCase extends AuthBaseUseCase<LogoutSessionDto, void> {
  constructor (private readonly leavePresenceUseCase: LeavePresenceUseCase) {
    super();
  }

  async execute ({ authorization, refreshToken }: LogoutSessionDto): Promise<void> {
    const token = this.extractBearerToken(authorization);
    const session = await this.sessionService.getSession({ token });

    await this.sessionService.deleteSession({ token });
    if (refreshToken) await this.refreshService.revoke({ refreshToken });
    if (session) await this.leavePresenceUseCase.execute({ userId: session.userId });
  }
}

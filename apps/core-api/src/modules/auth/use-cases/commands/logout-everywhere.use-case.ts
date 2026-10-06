import { Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { LeavePresenceUseCase } from '../../../support';
import { SessionOwnerDto } from '../../dtos/input/session-owner.dto';

@Injectable()
export class LogoutEverywhereUseCase extends AuthBaseUseCase<SessionOwnerDto, void> {
  constructor (private readonly leavePresenceUseCase: LeavePresenceUseCase) {
    super();
  }

  async execute ({ userId }: SessionOwnerDto): Promise<void> {
    await this.refreshService.revokeEverySession({ userId });
    await this.leavePresenceUseCase.execute({ userId });
  }
}

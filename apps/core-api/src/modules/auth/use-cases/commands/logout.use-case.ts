import { Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../base/auth-base.use-case';

@Injectable()
export class LogoutUseCase extends AuthBaseUseCase<string, void> {
  async execute (authorization?: string): Promise<void> {
    await this.sessionService.deleteSession(this.extractBearerToken(authorization));
  }
}

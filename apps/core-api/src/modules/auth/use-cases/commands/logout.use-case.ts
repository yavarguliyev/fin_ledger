import { Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthorizationDto } from '../../dtos/request/authorization.dto';

@Injectable()
export class LogoutUseCase extends AuthBaseUseCase<AuthorizationDto, void> {
  async execute ({ authorization }: AuthorizationDto): Promise<void> {
    await this.sessionService.deleteSession({ token: this.extractBearerToken(authorization) });
  }
}

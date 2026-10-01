import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_CONSTANTS } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { RefreshSessionDto } from '../../dtos/request/refresh-session.dto';
import { AuthResponseDto } from '../../dtos/response/auth-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthHelper } from '../../helpers/auth.helper';

@Injectable()
export class RefreshSessionUseCase extends AuthBaseUseCase<RefreshSessionDto, AuthResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute ({ refreshToken }: RefreshSessionDto): Promise<AuthResponseDto> {
    if (!refreshToken) throw new UnauthorizedException(AUTH_CONSTANTS.REFRESH_INVALID_MESSAGE);

    const rotated = await this.refreshService.rotate({ refreshToken });
    const user = await this.authRepository.findById({ id: rotated.record.userId });

    if (!user || user.deletedAt) {
      await this.refreshService.revokeEverySession({ userId: rotated.record.userId });
      throw new UnauthorizedException(AUTH_CONSTANTS.REFRESH_INVALID_MESSAGE);
    }

    return AuthHelper.createSessionResponse({
      dto: user,
      sessionService: this.sessionService,
      configService: this.configService,
      refreshToken: rotated.refreshToken
    });
  }
}

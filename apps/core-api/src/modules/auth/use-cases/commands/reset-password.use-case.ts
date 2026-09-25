import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenPurpose, PostgresService, SessionHelper } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { ResetPasswordDto } from '../../dtos/request/reset-password.dto';
import { ResetPasswordResponseDto } from '../../dtos/response/reset-password-response.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthTokenRepository } from '../../repositories/auth-token.repository';
import { AuthTokenHelper } from '../../helpers/auth-token.helper';

@Injectable()
export class ResetPasswordUseCase extends AuthBaseUseCase<ResetPasswordDto, ResetPasswordResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository
  ) {
    super();
  }

  async execute ({ token, password }: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    const passwordHash = await SessionHelper.hash({ password });

    const userId = await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        const claimed = await AuthTokenHelper.claim({
          authTokenRepository: this.authTokenRepository,
          token,
          purposes: [AuthTokenPurpose.PASSWORD_RESET],
          adapter
        });

        const user = await this.authRepository.findById({ id: claimed.userId, adapter });
        if (!user || user.deletedAt) throw new UnauthorizedException('User not found');

        await this.authRepository.update({ id: user.id, data: { passwordHash, passwordChangedAt: new Date().toISOString() }, adapter });
        return user.id;
      }
    });

    await this.sessionService.deleteUserSessions({ userId });

    return { success: true, message: 'Password reset successfully. Please login with your new password.' };
  }
}

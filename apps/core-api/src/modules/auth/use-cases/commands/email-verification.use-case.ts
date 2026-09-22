import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenPurpose, PostgresService, SessionHelper, UserStatus } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthTokenRepository } from '../../repositories/auth-token.repository';
import { AuthHelper } from '../../helpers/auth.helper';
import { AuthTokenHelper } from '../../helpers/auth-token.helper';
import { SessionResponseDto } from '../../dtos/response/session-response.dto';
import { VerifyEmailDto } from '../../dtos/request/verify-email.dto';

@Injectable()
export class EmailVerificationUseCase extends AuthBaseUseCase<VerifyEmailDto, SessionResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository
  ) {
    super();
  }

  async execute ({ token, password }: VerifyEmailDto): Promise<SessionResponseDto> {
    const purposes = password ? [AuthTokenPurpose.EMAIL_VERIFICATION, AuthTokenPurpose.ACCOUNT_INVITE] : [AuthTokenPurpose.EMAIL_VERIFICATION];
    const passwordUpdate = password ? { passwordHash: await SessionHelper.hash({ password }), passwordChangedAt: new Date().toISOString() } : {};

    const updatedUser = await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        const { userId } = await AuthTokenHelper.claim({ authTokenRepository: this.authTokenRepository, token, purposes, adapter });

        const user = await this.authRepository.findById({ id: userId, adapter });
        if (!user || user.deletedAt) throw new UnauthorizedException('User not found');

        return this.authRepository.update({
          id: userId,
          data: {
            isEmailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
            ...passwordUpdate,
            ...(user.status === UserStatus.PENDING && { status: UserStatus.ACTIVE })
          },
          adapter
        });
      }
    });

    if (!updatedUser) throw new UnauthorizedException('Failed to verify email');

    return AuthHelper.createSessionResponse({
      dto: updatedUser,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    });
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailTemplateType, PasswordAlgorithm, SessionHelper } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { AuthHelper } from '../../../helpers/auth.helper';
import { ChangePasswordDto } from '../../../dtos/input/change-password.dto';
import { AuthResponseDto } from '../../../dtos/response/auth-response.dto';
import { ACCOUNT_EMAIL, ACCOUNT_ERRORS } from '../../../constants/account/account-email.constant';
import { AccountHolderDto } from '../../../dtos/helper/account-holder.dto';

@Injectable()
export class ChangePasswordUseCase extends AuthBaseUseCase<ChangePasswordDto, AuthResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute ({ userId, currentPassword, newPassword }: ChangePasswordDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user || user.deletedAt) throw new NotFoundException(ACCOUNT_ERRORS.USER_NOT_FOUND);

    const matches = await SessionHelper.matches({ password: currentPassword, passwordHash: user.passwordHash });
    if (!matches) throw new BadRequestException(ACCOUNT_ERRORS.WRONG_PASSWORD);

    const reused = await SessionHelper.matches({ password: newPassword, passwordHash: user.passwordHash });
    if (reused) throw new BadRequestException(ACCOUNT_ERRORS.SAME_PASSWORD);

    const updated = await this.authRepository.update({
      id: userId,
      data: {
        passwordHash: await SessionHelper.hash({ password: newPassword }),
        passwordAlgo: PasswordAlgorithm.ARGON2ID,
        passwordChangedAt: new Date().toISOString()
      }
    });

    if (!updated) throw new NotFoundException(ACCOUNT_ERRORS.USER_NOT_FOUND);

    await this.refreshService.revokeEverySession({ userId });
    await this.notify({ user: updated });

    return AuthHelper.createSessionResponse({
      dto: updated,
      sessionService: this.sessionService,
      configService: this.configService,
      refreshToken: await this.refreshService.issue({ userId })
    });
  }

  private async notify ({ user }: AccountHolderDto): Promise<void> {
    await this.publishAccountEmail({
      eventType: EmailTemplateType.PASSWORD_CHANGED,
      userId: user.id,
      eventPayload: {
        to: user.email,
        subject: ACCOUNT_EMAIL.PASSWORD_CHANGED.SUBJECT,
        purpose: ACCOUNT_EMAIL.PASSWORD_CHANGED.PURPOSE,
        title: ACCOUNT_EMAIL.PASSWORD_CHANGED.TITLE,
        body: ACCOUNT_EMAIL.PASSWORD_CHANGED.BODY,
        url: `${this.frontendUrl}${ACCOUNT_EMAIL.PROFILE_PATH}`
      }
    });
  }
}

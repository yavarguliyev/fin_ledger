import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthTokenPurpose, EmailTemplateType, SessionHelper } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { AuthTokenRepository } from '../../../repositories/auth-token.repository';
import { AuthTokenHelper } from '../../../helpers/auth-token.helper';
import { ChangeEmailDto } from '../../../dtos/input/change-email.dto';
import { AccountMessageResponseDto } from '../../../dtos/response/account-message-response.dto';
import { ACCOUNT_EMAIL, ACCOUNT_ERRORS } from '../../../constants/account/account-email.constant';
import { FRONTEND } from '../../../../../shared/constants/config/frontend.constant';

@Injectable()
export class ChangeEmailUseCase extends AuthBaseUseCase<ChangeEmailDto, AccountMessageResponseDto> {
  constructor (
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository
  ) {
    super();
  }

  async execute ({ userId, newEmail, currentPassword }: ChangeEmailDto): Promise<AccountMessageResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user || user.deletedAt) throw new NotFoundException(ACCOUNT_ERRORS.USER_NOT_FOUND);

    const matches = await SessionHelper.matches({ password: currentPassword, passwordHash: user.passwordHash });
    if (!matches) throw new BadRequestException(ACCOUNT_ERRORS.WRONG_PASSWORD);
    if (newEmail.toLowerCase() === user.email.toLowerCase()) throw new BadRequestException(ACCOUNT_ERRORS.SAME_EMAIL);

    const taken = await this.authRepository.findByEmailAny({ email: newEmail });
    if (taken) throw new BadRequestException(ACCOUNT_ERRORS.EMAIL_TAKEN);

    await this.authRepository.update({ id: userId, data: { pendingEmail: newEmail } });

    const token = await AuthTokenHelper.issue({ authTokenRepository: this.authTokenRepository, userId, purpose: AuthTokenPurpose.EMAIL_CHANGE });

    await this.publishAccountEmail({
      eventType: EmailTemplateType.EMAIL_CHANGE_CONFIRM,
      userId,
      eventPayload: {
        to: newEmail,
        subject: ACCOUNT_EMAIL.EMAIL_CHANGE.SUBJECT,
        purpose: ACCOUNT_EMAIL.EMAIL_CHANGE.PURPOSE,
        title: ACCOUNT_EMAIL.EMAIL_CHANGE.TITLE,
        body: ACCOUNT_EMAIL.EMAIL_CHANGE.BODY,
        url: `${this.frontendUrl}${ACCOUNT_EMAIL.CONFIRM_PATH}${FRONTEND.TOKEN_QUERY}${token}`
      }
    });

    return { status: true, message: 'Open the link we sent to the new address to finish the change.' };
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthTokenPurpose, EmailTemplateType, PostgresService } from '@common/libs';
import { Inject } from '@nestjs/common';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { AuthTokenRepository } from '../../../repositories/auth-token.repository';
import { AuthTokenHelper } from '../../../helpers/auth-token.helper';
import { ConfirmEmailChangeRequestDto } from '../../../dtos/request/confirm-email-change-request.dto';
import { AccountMessageResponseDto } from '../../../dtos/response/account-message-response.dto';
import { ACCOUNT_EMAIL, ACCOUNT_ERRORS } from '../../../constants/account/account-email.constant';
import { NotifyPreviousAddressDto } from '../../../dtos/helper/notify-previous-address.dto';

@Injectable()
export class ConfirmEmailChangeUseCase extends AuthBaseUseCase<ConfirmEmailChangeRequestDto, AccountMessageResponseDto> {
  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository
  ) {
    super();
  }

  async execute ({ token }: ConfirmEmailChangeRequestDto): Promise<AccountMessageResponseDto> {
    const changed = await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        const { userId } = await AuthTokenHelper.claim({
          authTokenRepository: this.authTokenRepository,
          token,
          purposes: [AuthTokenPurpose.EMAIL_CHANGE],
          adapter
        });

        const user = await this.authRepository.findById({ id: userId, adapter });
        if (!user || user.deletedAt) throw new BadRequestException(ACCOUNT_ERRORS.USER_NOT_FOUND);
        if (!user.pendingEmail) throw new BadRequestException(ACCOUNT_ERRORS.NO_PENDING_EMAIL);

        const taken = await this.authRepository.findByEmailAny({ email: user.pendingEmail, adapter });
        if (taken && taken.id !== userId) throw new BadRequestException(ACCOUNT_ERRORS.EMAIL_TAKEN);

        await this.authRepository.update({ id: userId, data: { email: user.pendingEmail, pendingEmail: null }, adapter });
        await this.notifyPreviousAddress({ userId, previousEmail: user.email, newEmail: user.pendingEmail, adapter });

        return { userId, previousEmail: user.email, newEmail: user.pendingEmail };
      }
    });

    await this.refreshService.revokeEverySession({ userId: changed.userId });

    return { status: true, message: 'Your email address was changed. Please sign in again.' };
  }

  private async notifyPreviousAddress ({ userId, previousEmail, adapter }: NotifyPreviousAddressDto): Promise<void> {
    await this.publishAccountEmail({
      eventType: EmailTemplateType.EMAIL_CHANGED_NOTICE,
      userId,
      adapter,
      eventPayload: {
        to: previousEmail,
        subject: ACCOUNT_EMAIL.EMAIL_CHANGED.SUBJECT,
        purpose: ACCOUNT_EMAIL.EMAIL_CHANGED.PURPOSE,
        title: ACCOUNT_EMAIL.EMAIL_CHANGED.TITLE,
        body: ACCOUNT_EMAIL.EMAIL_CHANGED.BODY,
        url: `${this.frontendUrl}${ACCOUNT_EMAIL.PROFILE_PATH}`
      }
    });
  }
}

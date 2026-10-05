import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailTemplateType, PostgresService, RecoveryCodeHelper, TotpService } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { MfaRecoveryCodeRepository } from '../../../repositories/mfa-recovery-code.repository';
import { MfaHelper } from '../../../helpers/mfa.helper';
import { EnableMfaDto } from '../../../dtos/input/enable-mfa.dto';
import { MfaRecoveryCodesResponseDto } from '../../../dtos/response/mfa-recovery-codes-response.dto';
import { MFA_EMAIL } from '../../../constants/mfa/mfa-policy.constant';
import { MFA_ERRORS } from '../../../constants/mfa/mfa-errors.constant';

@Injectable()
export class EnableMfaUseCase extends AuthBaseUseCase<EnableMfaDto, MfaRecoveryCodesResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly totpService: TotpService
  ) {
    super();
  }

  async execute ({ userId, code }: EnableMfaDto): Promise<MfaRecoveryCodesResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(MFA_ERRORS.USER_NOT_FOUND);
    if (user.mfaEnabledAt) throw new ConflictException(MFA_ERRORS.ALREADY_ENABLED);
    if (!user.mfaSecretEncrypted) throw new BadRequestException(MFA_ERRORS.START_SETUP_FIRST);

    const { codes, hashes } = RecoveryCodeHelper.generate();
    const { totpService, mfaRecoveryCodeRepository } = this;

    await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        const { timeStep } = await MfaHelper.verifySecondFactor({ user, code, totpService, mfaRecoveryCodeRepository, adapter });

        await this.authRepository.update({
          id: userId,
          data: { mfaEnabledAt: new Date().toISOString(), mfaLastUsedStep: timeStep ?? null },
          adapter
        });
        await mfaRecoveryCodeRepository.replace({ userId, hashes, adapter });
        await this.publishAccountEmail({
          eventType: EmailTemplateType.MFA_ENABLED,
          userId,
          adapter,
          eventPayload: {
            to: user.email,
            subject: MFA_EMAIL.ENABLED.SUBJECT,
            purpose: MFA_EMAIL.ENABLED.PURPOSE,
            title: MFA_EMAIL.ENABLED.TITLE,
            body: MFA_EMAIL.ENABLED.BODY,
            url: `${this.frontendUrl}${MFA_EMAIL.PROFILE_PATH}`
          }
        });
      }
    });

    return { recoveryCodes: codes };
  }
}

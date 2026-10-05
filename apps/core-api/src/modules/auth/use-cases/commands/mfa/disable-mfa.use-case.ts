import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { EmailTemplateType, PostgresService, SessionHelper, TotpService } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { MfaRecoveryCodeRepository } from '../../../repositories/mfa-recovery-code.repository';
import { MfaHelper } from '../../../helpers/mfa.helper';
import { DisableMfaDto } from '../../../dtos/input/disable-mfa.dto';
import { MfaDisabledResponseDto } from '../../../dtos/response/mfa-disabled-response.dto';
import { MfaPolicyHelper } from '../../../helpers/mfa-policy.helper';
import { MFA_EMAIL } from '../../../constants/mfa/mfa-policy.constant';
import { MFA_ERRORS } from '../../../constants/mfa/mfa-errors.constant';
import { PasskeyStepUpService } from '../../../services/passkey-step-up.service';

@Injectable()
export class DisableMfaUseCase extends AuthBaseUseCase<DisableMfaDto, MfaDisabledResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly totpService: TotpService,
    private readonly stepUp: PasskeyStepUpService
  ) {
    super();
  }

  async execute ({ userId, password, code }: DisableMfaDto): Promise<MfaDisabledResponseDto> {
    await this.stepUp.assertConfirmed({ userId });

    const user = await this.authRepository.findById({ id: userId });
    if (!user?.mfaEnabledAt) throw new BadRequestException(MFA_ERRORS.NOT_ENABLED);
    if (MfaPolicyHelper.isRequired({ role: user.role })) throw new ForbiddenException(MFA_ERRORS.REQUIRED_FOR_ROLE);

    await SessionHelper.compare({ password, passwordHash: user.passwordHash });

    const { totpService, mfaRecoveryCodeRepository } = this;

    await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        await MfaHelper.verifySecondFactor({ user, code, totpService, mfaRecoveryCodeRepository, adapter });
        await this.authRepository.update({ id: userId, data: { mfaSecretEncrypted: null, mfaEnabledAt: null, mfaLastUsedStep: null }, adapter });
        await mfaRecoveryCodeRepository.retire({ userId, adapter });
        await this.publishAccountEmail({
          eventType: EmailTemplateType.MFA_DISABLED,
          userId,
          adapter,
          eventPayload: {
            to: user.email,
            subject: MFA_EMAIL.DISABLED.SUBJECT,
            purpose: MFA_EMAIL.DISABLED.PURPOSE,
            title: MFA_EMAIL.DISABLED.TITLE,
            body: MFA_EMAIL.DISABLED.BODY,
            url: `${this.frontendUrl}${MFA_EMAIL.PROFILE_PATH}`
          }
        });
      }
    });

    return { success: true, message: MFA_EMAIL.DISABLED_MESSAGE };
  }
}

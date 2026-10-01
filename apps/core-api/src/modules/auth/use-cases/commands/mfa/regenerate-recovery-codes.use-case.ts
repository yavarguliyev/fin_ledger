import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService, RecoveryCodeHelper, SessionHelper, TotpService } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { MfaRecoveryCodeRepository } from '../../../repositories/mfa-recovery-code.repository';
import { MfaHelper } from '../../../helpers/mfa.helper';
import { DisableMfaDto } from '../../../dtos/input/disable-mfa.dto';
import { MfaRecoveryCodesResponseDto } from '../../../dtos/response/mfa-recovery-codes-response.dto';
import { MFA_ERRORS } from '../../../constants/mfa/mfa-errors.constant';

@Injectable()
export class RegenerateRecoveryCodesUseCase extends AuthBaseUseCase<DisableMfaDto, MfaRecoveryCodesResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly totpService: TotpService
  ) {
    super();
  }

  async execute ({ userId, password, code }: DisableMfaDto): Promise<MfaRecoveryCodesResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user?.mfaEnabledAt) throw new BadRequestException(MFA_ERRORS.NOT_ENABLED);

    await SessionHelper.compare({ password, passwordHash: user.passwordHash });

    const { codes, hashes } = RecoveryCodeHelper.generate();
    const { totpService, mfaRecoveryCodeRepository } = this;

    await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        const { timeStep } = await MfaHelper.verifySecondFactor({ user, code, totpService, mfaRecoveryCodeRepository, adapter });

        if (timeStep) await this.authRepository.update({ id: userId, data: { mfaLastUsedStep: timeStep }, adapter });
        await mfaRecoveryCodeRepository.replace({ userId, hashes, adapter });
      }
    });

    return { recoveryCodes: codes };
  }
}

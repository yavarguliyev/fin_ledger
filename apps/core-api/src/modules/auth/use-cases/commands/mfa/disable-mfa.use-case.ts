import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService, SessionHelper, TotpService } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { MfaRecoveryCodeRepository } from '../../../repositories/mfa-recovery-code.repository';
import { MfaHelper } from '../../../helpers/mfa.helper';
import { DisableMfaDto } from '../../../dtos/input/disable-mfa.dto';
import { MfaDisabledResponseDto } from '../../../dtos/response/mfa-disabled-response.dto';

@Injectable()
export class DisableMfaUseCase extends AuthBaseUseCase<DisableMfaDto, MfaDisabledResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly totpService: TotpService
  ) {
    super();
  }

  async execute ({ userId, password, code }: DisableMfaDto): Promise<MfaDisabledResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user?.mfaEnabledAt) throw new BadRequestException('Two-factor authentication is not enabled');

    await SessionHelper.compare({ password, passwordHash: user.passwordHash });

    const { totpService, mfaRecoveryCodeRepository } = this;

    await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        await MfaHelper.verifySecondFactor({ user, code, totpService, mfaRecoveryCodeRepository, adapter });

        await this.authRepository.update({ id: userId, data: { mfaSecretEncrypted: null, mfaEnabledAt: null, mfaLastUsedStep: null }, adapter });
        await mfaRecoveryCodeRepository.retire({ userId, adapter });
      }
    });

    return { success: true, message: 'Two-factor authentication has been turned off' };
  }
}

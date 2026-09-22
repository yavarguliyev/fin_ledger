import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService, RecoveryCodeHelper, TotpService } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { MfaRecoveryCodeRepository } from '../../../repositories/mfa-recovery-code.repository';
import { MfaHelper } from '../../../helpers/mfa.helper';
import { EnableMfaDto } from '../../../dtos/input/enable-mfa.dto';
import { MfaRecoveryCodesResponseDto } from '../../../dtos/response/mfa-recovery-codes-response.dto';

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
    if (!user) throw new NotFoundException('User not found');
    if (user.mfaEnabledAt) throw new ConflictException('Two-factor authentication is already enabled');
    if (!user.mfaSecretEncrypted) throw new BadRequestException('Start two-factor setup first');

    const { codes, hashes } = RecoveryCodeHelper.generate();
    const { totpService, mfaRecoveryCodeRepository } = this;

    await this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        const { timeStep } = await MfaHelper.verifySecondFactor({ user, code, totpService, mfaRecoveryCodeRepository, adapter });

        await this.authRepository.update({ id: userId, data: { mfaEnabledAt: new Date().toISOString(), mfaLastUsedStep: timeStep ?? null }, adapter });
        await mfaRecoveryCodeRepository.replace({ userId, hashes, adapter });
      }
    });

    return { recoveryCodes: codes };
  }
}

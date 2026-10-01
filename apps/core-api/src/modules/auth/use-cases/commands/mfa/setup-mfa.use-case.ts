import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TotpService } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { MfaUserDto } from '../../../dtos/input/mfa-user.dto';
import { MfaEnrollmentResponseDto } from '../../../dtos/response/mfa-enrollment-response.dto';

@Injectable()
export class SetupMfaUseCase extends AuthBaseUseCase<MfaUserDto, MfaEnrollmentResponseDto> {
  constructor (
    private readonly authRepository: AuthRepository,
    private readonly totpService: TotpService
  ) {
    super();
  }

  async execute ({ userId }: MfaUserDto): Promise<MfaEnrollmentResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    if (user.mfaEnabledAt) throw new ConflictException('Two-factor authentication is already enabled');

    const secret = this.totpService.createSecret();
    await this.authRepository.update({ id: userId, data: { mfaSecretEncrypted: this.totpService.encryptSecret({ secret }), mfaLastUsedStep: null } });

    return this.totpService.buildEnrollment({ secret, accountName: user.email });
  }
}

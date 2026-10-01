import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthRepository } from '../../repositories/auth.repository';
import { MfaUserDto } from '../../dtos/input/mfa-user.dto';
import { MfaStatusResponseDto } from '../../dtos/response/mfa-status-response.dto';
import { MfaPolicyHelper } from '../../helpers/mfa-policy.helper';
import { MFA_ERRORS } from '../../constants/mfa/mfa-errors.constant';

@Injectable()
export class GetMfaStatusUseCase extends AuthBaseUseCase<MfaUserDto, MfaStatusResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute ({ userId }: MfaUserDto): Promise<MfaStatusResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(MFA_ERRORS.USER_NOT_FOUND);
    return {
      enabled: user.mfaEnabledAt !== null,
      pending: user.mfaEnabledAt === null && user.mfaSecretEncrypted !== null,
      required: MfaPolicyHelper.isRequired({ role: user.role })
    };
  }
}

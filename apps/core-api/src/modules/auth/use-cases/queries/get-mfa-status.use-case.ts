import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthRepository } from '../../repositories/auth.repository';
import { MfaUserDto } from '../../dtos/input/mfa-user.dto';
import { MfaStatusResponseDto } from '../../dtos/response/mfa-status-response.dto';

@Injectable()
export class GetMfaStatusUseCase extends AuthBaseUseCase<MfaUserDto, MfaStatusResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute ({ userId }: MfaUserDto): Promise<MfaStatusResponseDto> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    return { enabled: user.mfaEnabledAt !== null, pending: user.mfaEnabledAt === null && user.mfaSecretEncrypted !== null };
  }
}

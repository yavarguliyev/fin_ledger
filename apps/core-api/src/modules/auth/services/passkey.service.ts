import { Injectable } from '@nestjs/common';

import { PasskeyRegistrationUseCase } from '../use-cases/commands/passkeys/passkey-registration.use-case';
import { PasskeyLoginUseCase } from '../use-cases/commands/passkeys/passkey-login.use-case';
import { RemovePasskeyUseCase } from '../use-cases/commands/passkeys/remove-passkey.use-case';
import { ListPasskeysUseCase } from '../use-cases/queries/list-passkeys.use-case';
import { PasskeyStepUpUseCase } from '../use-cases/commands/passkeys/passkey-step-up.use-case';
import { VerifyStepUpDto } from '../dtos/passkeys/verify-step-up.dto';
import { PasskeyOwnerDto } from '../dtos/passkeys/passkey-owner.dto';
import { VerifyRegistrationDto } from '../dtos/passkeys/verify-registration.dto';
import { PasskeyRegisteredDto } from '../dtos/passkeys/passkey-registered.dto';
import { PasskeyLoginOptionsDto } from '../dtos/passkeys/passkey-login-options.dto';
import { VerifyPasskeyLoginDto } from '../dtos/passkeys/verify-passkey-login.dto';
import { PasskeySummaryDto } from '../dtos/passkeys/passkey-summary.dto';
import { RemovePasskeyDto } from '../dtos/passkeys/remove-passkey.dto';
import { AccountMessageResponseDto } from '../dtos/response/account-message-response.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';

@Injectable()
export class PasskeyService {
  constructor (
    private readonly registration: PasskeyRegistrationUseCase,
    private readonly login: PasskeyLoginUseCase,
    private readonly listPasskeysUseCase: ListPasskeysUseCase,
    private readonly removePasskeyUseCase: RemovePasskeyUseCase,
    private readonly stepUpUseCase: PasskeyStepUpUseCase
  ) {}

  async registrationOptions (dto: PasskeyOwnerDto): Promise<unknown> {
    return this.registration.execute(dto);
  }

  async verifyRegistration (dto: VerifyRegistrationDto): Promise<PasskeyRegisteredDto> {
    return this.registration.verify(dto);
  }

  async loginOptions (dto: PasskeyLoginOptionsDto): Promise<unknown> {
    return this.login.options(dto);
  }

  async verifyLogin (dto: VerifyPasskeyLoginDto): Promise<AuthResponseDto> {
    return this.login.execute(dto);
  }

  async list (dto: PasskeyOwnerDto): Promise<PasskeySummaryDto[]> {
    return this.listPasskeysUseCase.execute(dto);
  }

  async remove (dto: RemovePasskeyDto): Promise<AccountMessageResponseDto> {
    return this.removePasskeyUseCase.execute(dto);
  }

  async stepUpOptions (dto: PasskeyOwnerDto): Promise<unknown> {
    return this.stepUpUseCase.options(dto);
  }

  async confirmStepUp (dto: VerifyStepUpDto): Promise<AccountMessageResponseDto> {
    return this.stepUpUseCase.execute(dto);
  }
}

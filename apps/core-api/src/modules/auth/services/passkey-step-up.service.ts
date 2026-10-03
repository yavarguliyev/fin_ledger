import { Injectable } from '@nestjs/common';

import { GrantPasskeyStepUpUseCase } from '../use-cases/commands/passkeys/grant-passkey-step-up.use-case';
import { AssertPasskeyStepUpUseCase } from '../use-cases/commands/passkeys/assert-passkey-step-up.use-case';
import { PasskeyOwnerDto } from '../dtos/passkeys/passkey-owner.dto';

@Injectable()
export class PasskeyStepUpService {
  constructor (
    private readonly grantPasskeyStepUpUseCase: GrantPasskeyStepUpUseCase,
    private readonly assertPasskeyStepUpUseCase: AssertPasskeyStepUpUseCase
  ) {}

  async grant (dto: PasskeyOwnerDto): Promise<void> {
    return this.grantPasskeyStepUpUseCase.execute(dto);
  }

  async assertConfirmed (dto: PasskeyOwnerDto): Promise<void> {
    return this.assertPasskeyStepUpUseCase.execute(dto);
  }
}

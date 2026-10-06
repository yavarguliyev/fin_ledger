import { Injectable } from '@nestjs/common';

import { AssertPasskeyStepUpUseCase } from '../use-cases/commands/passkeys/assert-passkey-step-up.use-case';
import { PasskeyOwnerDto } from '../dtos/passkeys/passkey-owner.dto';

@Injectable()
export class PasskeyStepUpService {
  constructor (private readonly assertPasskeyStepUpUseCase: AssertPasskeyStepUpUseCase) {}

  async assertConfirmed (dto: PasskeyOwnerDto): Promise<void> {
    return this.assertPasskeyStepUpUseCase.execute(dto);
  }
}

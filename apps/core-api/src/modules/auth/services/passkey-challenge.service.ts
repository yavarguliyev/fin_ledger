import { Injectable } from '@nestjs/common';

import { RememberPasskeyChallengeUseCase } from '../use-cases/commands/passkeys/remember-passkey-challenge.use-case';
import { TakePasskeyChallengeUseCase } from '../use-cases/commands/passkeys/take-passkey-challenge.use-case';
import { StoreChallengeDto } from '../dtos/passkeys/store-challenge.dto';
import { ChallengeScopeDto } from '../dtos/passkeys/challenge-scope.dto';

@Injectable()
export class PasskeyChallengeService {
  constructor (
    private readonly rememberPasskeyChallengeUseCase: RememberPasskeyChallengeUseCase,
    private readonly takePasskeyChallengeUseCase: TakePasskeyChallengeUseCase
  ) {}

  async remember (dto: StoreChallengeDto): Promise<void> {
    return this.rememberPasskeyChallengeUseCase.execute(dto);
  }

  async take (dto: ChallengeScopeDto): Promise<string> {
    return this.takePasskeyChallengeUseCase.execute(dto);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { CacheTake, CacheWrite } from '@common/libs';

import { ChallengeScopeDto } from '../dtos/passkeys/challenge-scope.dto';
import { PASSKEY } from '../constants/passkeys/passkey.constant';
import { PasskeyHelper } from '../helpers/passkey.helper';
import { StoreChallengeDto } from '../dtos/passkeys/store-challenge.dto';

@Injectable()
export class PasskeyChallengeService {
  @CacheWrite({ key: (dto: StoreChallengeDto) => PasskeyHelper.challengeKey(dto), ttlSeconds: PASSKEY.CHALLENGE_TTL_SECONDS })
  async remember ({ challenge }: StoreChallengeDto): Promise<string> {
    return Promise.resolve(challenge);
  }

  @CacheTake({ key: (scope: ChallengeScopeDto) => PasskeyHelper.challengeKey(scope) })
  async take (_scope: ChallengeScopeDto): Promise<string> {
    return Promise.reject(new BadRequestException(PASSKEY.NO_CHALLENGE_MESSAGE));
  }
}

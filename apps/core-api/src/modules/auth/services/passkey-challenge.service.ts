import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { StoreChallengeDto } from '../dtos/passkeys/store-challenge.dto';
import { ChallengeScopeDto } from '../dtos/passkeys/challenge-scope.dto';
import { PASSKEY } from '../constants/passkeys/passkey.constant';

@Injectable()
export class PasskeyChallengeService {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider) {}

  async remember ({ scope, owner, challenge }: StoreChallengeDto): Promise<void> {
    await this.redis.set({ key: PasskeyChallengeService.keyFor({ scope, owner }), value: challenge, ttlSeconds: PASSKEY.CHALLENGE_TTL_SECONDS });
  }

  async take ({ scope, owner }: ChallengeScopeDto): Promise<string> {
    const key = PasskeyChallengeService.keyFor({ scope, owner });
    const challenge = await this.redis.get<string>({ key });

    if (!challenge) throw new BadRequestException(PASSKEY.NO_CHALLENGE_MESSAGE);

    await this.redis.delete({ key });

    return challenge;
  }

  private static keyFor ({ scope, owner }: ChallengeScopeDto): string {
    return `${PASSKEY.CHALLENGE_PREFIX}${scope}:${owner}`;
  }
}

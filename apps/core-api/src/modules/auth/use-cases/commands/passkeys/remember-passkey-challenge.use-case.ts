import { Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { PasskeyHelper } from '../../../helpers/passkey.helper';
import { StoreChallengeDto } from '../../../dtos/passkeys/store-challenge.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';

@Injectable()
export class RememberPasskeyChallengeUseCase extends AuthBaseUseCase<StoreChallengeDto, void> {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider) {
    super();
  }

  async execute ({ scope, owner, challenge }: StoreChallengeDto): Promise<void> {
    await this.redis.set({ key: PasskeyHelper.challengeKey({ scope, owner }), value: challenge, ttlSeconds: PASSKEY.CHALLENGE_TTL_SECONDS });
  }
}

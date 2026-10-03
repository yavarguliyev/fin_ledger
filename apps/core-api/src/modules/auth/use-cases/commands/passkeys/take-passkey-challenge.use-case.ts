import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { PasskeyHelper } from '../../../helpers/passkey.helper';
import { ChallengeScopeDto } from '../../../dtos/passkeys/challenge-scope.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';

@Injectable()
export class TakePasskeyChallengeUseCase extends AuthBaseUseCase<ChallengeScopeDto, string> {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider) {
    super();
  }

  async execute ({ scope, owner }: ChallengeScopeDto): Promise<string> {
    const key = PasskeyHelper.challengeKey({ scope, owner });
    const challenge = await this.redis.get<string>({ key });

    if (!challenge) throw new BadRequestException(PASSKEY.NO_CHALLENGE_MESSAGE);

    await this.redis.delete({ key });

    return challenge;
  }
}

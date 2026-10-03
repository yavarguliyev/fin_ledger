import { Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { PasskeyHelper } from '../../../helpers/passkey.helper';
import { PasskeyOwnerDto } from '../../../dtos/passkeys/passkey-owner.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';

@Injectable()
export class GrantPasskeyStepUpUseCase extends AuthBaseUseCase<PasskeyOwnerDto, void> {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider) {
    super();
  }

  async execute ({ userId }: PasskeyOwnerDto): Promise<void> {
    await this.redis.set({ key: PasskeyHelper.grantKey({ userId }), value: PASSKEY.GRANT_VALUE, ttlSeconds: PASSKEY.GRANT_TTL_SECONDS });
  }
}

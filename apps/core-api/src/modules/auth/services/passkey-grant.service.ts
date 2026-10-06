import { Injectable } from '@nestjs/common';
import { CacheTake, CacheWrite } from '@common/libs';

import { PASSKEY } from '../constants/passkeys/passkey.constant';
import { PasskeyHelper } from '../helpers/passkey.helper';
import { PasskeyOwnerDto } from '../dtos/passkeys/passkey-owner.dto';

@Injectable()
export class PasskeyGrantService {
  @CacheWrite({ key: (owner: PasskeyOwnerDto) => PasskeyHelper.grantKey(owner), ttlSeconds: PASSKEY.GRANT_TTL_SECONDS })
  async grant (_owner: PasskeyOwnerDto): Promise<string> {
    return Promise.resolve(PASSKEY.GRANT_VALUE);
  }

  @CacheTake({ key: (owner: PasskeyOwnerDto) => PasskeyHelper.grantKey(owner) })
  async take (_owner: PasskeyOwnerDto): Promise<string | null> {
    return Promise.resolve(null);
  }
}

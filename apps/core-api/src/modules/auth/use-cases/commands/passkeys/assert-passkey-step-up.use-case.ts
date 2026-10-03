import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { UserCredentialRepository } from '../../../repositories/user-credential.repository';
import { PasskeyHelper } from '../../../helpers/passkey.helper';
import { PasskeyOwnerDto } from '../../../dtos/passkeys/passkey-owner.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';

@Injectable()
export class AssertPasskeyStepUpUseCase extends AuthBaseUseCase<PasskeyOwnerDto, void> {
  constructor (
    @Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider,
    private readonly credentialRepository: UserCredentialRepository
  ) {
    super();
  }

  async execute ({ userId }: PasskeyOwnerDto): Promise<void> {
    if (!this.enabled()) return;

    const credentials = await this.credentialRepository.findForUser({ userId });
    if (credentials.length === 0) return;

    const key = PasskeyHelper.grantKey({ userId });
    const granted = await this.redis.get<string>({ key });

    if (granted !== PASSKEY.GRANT_VALUE) throw new ForbiddenException(PASSKEY.STEP_UP_REQUIRED_MESSAGE);

    await this.redis.delete({ key });
  }

  private enabled (): boolean {
    return this.configService.get<string>(PASSKEY.STEP_UP_ENABLED_KEY) === PASSKEY.STEP_UP_ENABLED_VALUE;
  }
}

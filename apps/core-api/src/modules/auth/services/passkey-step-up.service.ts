import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { UserCredentialRepository } from '../repositories/user-credential.repository';
import { PasskeyOwnerDto } from '../dtos/passkeys/passkey-owner.dto';
import { PASSKEY } from '../constants/passkeys/passkey.constant';

@Injectable()
export class PasskeyStepUpService {
  constructor (
    @Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider,
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly credentialRepository: UserCredentialRepository
  ) {}

  async grant ({ userId }: PasskeyOwnerDto): Promise<void> {
    await this.redis.set({ key: PasskeyStepUpService.keyFor({ userId }), value: PASSKEY.GRANT_VALUE, ttlSeconds: PASSKEY.GRANT_TTL_SECONDS });
  }

  async assertConfirmed ({ userId }: PasskeyOwnerDto): Promise<void> {
    if (!this.enabled()) return;

    const credentials = await this.credentialRepository.findForUser({ userId });
    if (credentials.length === 0) return;

    const key = PasskeyStepUpService.keyFor({ userId });
    const granted = await this.redis.get<string>({ key });

    if (granted !== PASSKEY.GRANT_VALUE) throw new ForbiddenException(PASSKEY.STEP_UP_REQUIRED_MESSAGE);

    await this.redis.delete({ key });
  }

  private enabled (): boolean {
    return this.configService.get<string>(PASSKEY.STEP_UP_ENABLED_KEY) === 'true';
  }

  private static keyFor ({ userId }: PasskeyOwnerDto): string {
    return `${PASSKEY.GRANT_PREFIX}${userId}`;
  }
}

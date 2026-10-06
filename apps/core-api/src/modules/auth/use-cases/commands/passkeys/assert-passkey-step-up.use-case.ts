import { ForbiddenException, Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';
import { PasskeyGrantService } from '../../../services/passkey-grant.service';
import { PasskeyOwnerDto } from '../../../dtos/passkeys/passkey-owner.dto';
import { UserCredentialRepository } from '../../../repositories/user-credential.repository';

@Injectable()
export class AssertPasskeyStepUpUseCase extends AuthBaseUseCase<PasskeyOwnerDto, void> {
  constructor (
    private readonly grants: PasskeyGrantService,
    private readonly credentialRepository: UserCredentialRepository
  ) {
    super();
  }

  async execute ({ userId }: PasskeyOwnerDto): Promise<void> {
    if (!this.enabled()) return;

    const credentials = await this.credentialRepository.findForUser({ userId });
    if (credentials.length === 0) return;

    if ((await this.grants.take({ userId })) !== PASSKEY.GRANT_VALUE) throw new ForbiddenException(PASSKEY.STEP_UP_REQUIRED_MESSAGE);
  }

  private enabled (): boolean {
    return this.configService.get<string>(PASSKEY.STEP_UP_ENABLED_KEY) === PASSKEY.STEP_UP_ENABLED_VALUE;
  }
}

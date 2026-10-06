import { ForbiddenException, Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';
import { PasskeyGrantService } from '../../../services/passkey-grant.service';
import { PasskeyOwnerDto } from '../../../dtos/passkeys/passkey-owner.dto';

@Injectable()
export class ConsumePasskeyGrantUseCase extends AuthBaseUseCase<PasskeyOwnerDto, void> {
  constructor (private readonly grants: PasskeyGrantService) {
    super();
  }

  async execute ({ userId }: PasskeyOwnerDto): Promise<void> {
    if ((await this.grants.take({ userId })) !== PASSKEY.GRANT_VALUE) throw new ForbiddenException(PASSKEY.STEP_UP_REQUIRED_MESSAGE);
  }
}

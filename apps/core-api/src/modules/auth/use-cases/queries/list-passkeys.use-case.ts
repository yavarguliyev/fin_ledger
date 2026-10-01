import { Injectable } from '@nestjs/common';

import { UserCredentialRepository } from '../../repositories/user-credential.repository';
import { PasskeyOwnerDto } from '../../dtos/passkeys/passkey-owner.dto';
import { PasskeySummaryDto } from '../../dtos/passkeys/passkey-summary.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';

@Injectable()
export class ListPasskeysUseCase extends AuthBaseUseCase<PasskeyOwnerDto, PasskeySummaryDto[]> {
  constructor (private readonly credentialRepository: UserCredentialRepository) {
    super();
  }

  async execute ({ userId }: PasskeyOwnerDto): Promise<PasskeySummaryDto[]> {
    const credentials = await this.credentialRepository.findForUser({ userId });
    return credentials.map(({ id, deviceLabel, backedUp, lastUsedAt, createdAt }) => ({
      id,
      deviceLabel,
      backedUp,
      lastUsedAt,
      createdAt
    }));
  }
}

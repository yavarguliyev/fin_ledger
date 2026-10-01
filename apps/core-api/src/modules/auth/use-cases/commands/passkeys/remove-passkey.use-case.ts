import { Injectable, NotFoundException } from '@nestjs/common';

import { UserCredentialRepository } from '../../../repositories/user-credential.repository';
import { RemovePasskeyDto } from '../../../dtos/passkeys/remove-passkey.dto';
import { AccountMessageResponseDto } from '../../../dtos/response/account-message-response.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';

@Injectable()
export class RemovePasskeyUseCase {
  constructor (private readonly credentialRepository: UserCredentialRepository) {}

  async execute ({ userId, id }: RemovePasskeyDto): Promise<AccountMessageResponseDto> {
    const credentials = await this.credentialRepository.findForUser({ userId });
    const owned = credentials.find(credential => credential.id === id);
    if (!owned) throw new NotFoundException(PASSKEY.NOT_FOUND_MESSAGE);

    await this.credentialRepository.delete({ id });
    return { status: true, message: PASSKEY.REMOVED_MESSAGE };
  }
}

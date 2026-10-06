import { ForbiddenException, Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { ChatLockDto } from '../../../dtos/passkeys/chat-lock.dto';
import { LockResponseDto, SupportLockService } from '../../../../support';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';
import { UserCredentialRepository } from '../../../repositories/user-credential.repository';

@Injectable()
export class LockChatUseCase extends AuthBaseUseCase<ChatLockDto, LockResponseDto> {
  constructor (
    private readonly credentialRepository: UserCredentialRepository,
    private readonly supportLockService: SupportLockService
  ) {
    super();
  }

  async execute ({ conversationId, userId, role }: ChatLockDto): Promise<LockResponseDto> {
    const credentials = await this.credentialRepository.findForUser({ userId });
    if (credentials.length === 0) throw new ForbiddenException(PASSKEY.PASSKEY_REQUIRED_MESSAGE);

    return this.supportLockService.lock({ conversationId, userId, role });
  }
}

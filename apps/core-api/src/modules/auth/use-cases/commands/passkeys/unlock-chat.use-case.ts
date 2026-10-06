import { Injectable } from '@nestjs/common';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { ChatLockDto } from '../../../dtos/passkeys/chat-lock.dto';
import { ConsumePasskeyGrantUseCase } from './consume-passkey-grant.use-case';
import { LockResponseDto, SupportLockService } from '../../../../support';

@Injectable()
export class UnlockChatUseCase extends AuthBaseUseCase<ChatLockDto, LockResponseDto> {
  constructor (
    private readonly consumeGrant: ConsumePasskeyGrantUseCase,
    private readonly supportLockService: SupportLockService
  ) {
    super();
  }

  async execute ({ conversationId, userId, role }: ChatLockDto): Promise<LockResponseDto> {
    await this.consumeGrant.execute({ userId });
    return this.supportLockService.openWindow({ conversationId, userId, role });
  }
}

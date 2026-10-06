import { Injectable } from '@nestjs/common';

import { ChatLockDto } from '../dtos/passkeys/chat-lock.dto';
import { LockChatUseCase } from '../use-cases/commands/passkeys/lock-chat.use-case';
import { LockResponseDto } from '../../support';
import { UnlockChatUseCase } from '../use-cases/commands/passkeys/unlock-chat.use-case';

@Injectable()
export class ChatLockService {
  constructor (
    private readonly lockChatUseCase: LockChatUseCase,
    private readonly unlockChatUseCase: UnlockChatUseCase
  ) {}

  async lock (dto: ChatLockDto): Promise<LockResponseDto> {
    return this.lockChatUseCase.execute(dto);
  }

  async unlock (dto: ChatLockDto): Promise<LockResponseDto> {
    return this.unlockChatUseCase.execute(dto);
  }
}

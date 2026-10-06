import { Injectable } from '@nestjs/common';

import { GetLockStateUseCase } from '../use-cases/queries/conversation/get-lock-state.use-case';
import { LockConversationUseCase } from '../use-cases/commands/conversation/lock-conversation.use-case';
import { LockResponseDto } from '../dtos/response/lock-response.dto';
import { OpenLockWindowUseCase } from '../use-cases/commands/conversation/open-lock-window.use-case';
import { ReadConversationDto } from '../dtos/input/read-conversation.dto';
import { RemoveLockUseCase } from '../use-cases/commands/conversation/remove-lock.use-case';

@Injectable()
export class SupportLockService {
  constructor (
    private readonly lockConversationUseCase: LockConversationUseCase,
    private readonly openLockWindowUseCase: OpenLockWindowUseCase,
    private readonly removeLockUseCase: RemoveLockUseCase,
    private readonly getLockStateUseCase: GetLockStateUseCase
  ) {}

  async lock (dto: ReadConversationDto): Promise<LockResponseDto> {
    return this.lockConversationUseCase.execute(dto);
  }

  async openWindow (dto: ReadConversationDto): Promise<LockResponseDto> {
    return this.openLockWindowUseCase.execute(dto);
  }

  async remove (dto: ReadConversationDto): Promise<LockResponseDto> {
    return this.removeLockUseCase.execute(dto);
  }

  async state (dto: ReadConversationDto): Promise<LockResponseDto> {
    return this.getLockStateUseCase.execute(dto);
  }
}

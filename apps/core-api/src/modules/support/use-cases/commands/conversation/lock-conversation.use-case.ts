import { Injectable } from '@nestjs/common';

import { LockResponseDto } from '../../../dtos/response/lock-response.dto';
import { ReadConversationDto } from '../../../dtos/input/read-conversation.dto';
import { SUPPORT_LOCK } from '../../../constants/chat/support-lock.constant';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportLockRepository } from '../../../repositories/support-lock.repository';

@Injectable()
export class LockConversationUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly lockRepository: SupportLockRepository
  ) {}

  async execute ({ conversationId, userId, role }: ReadConversationDto): Promise<LockResponseDto> {
    await this.access.requireMember({ conversationId, userId, role });
    await this.lockRepository.lock({ conversationId, userId });
    return SUPPORT_LOCK.CLOSED_STATE;
  }
}

import { Injectable } from '@nestjs/common';

import { ReadConversationDto } from '../../../dtos/input/read-conversation.dto';
import { StarredMessageDto } from '../../../dtos/message/starred-message.dto';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportStarRepository } from '../../../repositories/support-star.repository';

@Injectable()
export class ListStarredMessagesUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly starRepository: SupportStarRepository
  ) {}

  async execute ({ conversationId, userId, role }: ReadConversationDto): Promise<StarredMessageDto[]> {
    await this.access.require({ conversationId, userId, role });
    return this.starRepository.listFor({ userId, conversationId });
  }
}

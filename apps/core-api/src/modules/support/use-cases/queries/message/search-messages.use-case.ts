import { Injectable } from '@nestjs/common';

import { MessageHitResponseDto } from '../../../dtos/response/message-hit-response.dto';
import { SearchThreadDto } from '../../../dtos/input/search-thread.dto';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';

@Injectable()
export class SearchMessagesUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly messageRepository: SupportMessageRepository
  ) {}

  async execute ({ id, q, actorId, role }: SearchThreadDto): Promise<MessageHitResponseDto[]> {
    await this.access.require({ conversationId: id, userId: actorId, role });

    return this.messageRepository.search({ conversationId: id, actorId, term: q });
  }
}

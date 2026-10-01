import { Injectable } from '@nestjs/common';
import { SupportConversationContract } from '@common/contracts';

import { ListConversationsDto } from '../../../dtos/input/list-conversations.dto';
import { SupportMapperHelper } from '../../../helpers/support-mapper.helper';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';

@Injectable()
export class ListConversationsUseCase {
  constructor (private readonly conversationRepository: SupportConversationRepository) {}

  async execute (dto: ListConversationsDto): Promise<SupportConversationContract[]> {
    const rows = await this.conversationRepository.listForActor(dto);

    return rows.map(row => SupportMapperHelper.toConversation({ row }));
  }
}

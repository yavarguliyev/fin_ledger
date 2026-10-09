import { Injectable } from '@nestjs/common';
import { SupportConversationContract } from '@common/contracts';

import { ListConversationsDto } from '../../../dtos/input/list-conversations.dto';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportMapperHelper } from '../../../helpers/support-mapper.helper';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';

@Injectable()
export class ListConversationsUseCase {
  constructor (
    private readonly conversationRepository: SupportConversationRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute (dto: ListConversationsDto): Promise<SupportConversationContract[]> {
    const rows = await this.conversationRepository.listForActor(dto);

    return Promise.all(rows.map(async row => ({ ...SupportMapperHelper.toConversation({ row }), ...(await this.attachments.conversationAvatars({ row })) })));
  }
}

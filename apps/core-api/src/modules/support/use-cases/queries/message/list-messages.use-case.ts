import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportMessageContract } from '@common/contracts';

import { ListThreadDto } from '../../../dtos/input/list-thread.dto';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { SUPPORT } from '../../../constants/chat/support.constant';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';

@Injectable()
export class ListMessagesUseCase {
  constructor (
    private readonly conversationRepository: SupportConversationRepository,
    private readonly messageRepository: SupportMessageRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute ({ id, actorId, role, ...page }: ListThreadDto): Promise<SupportMessageContract[]> {
    const conversation = await this.conversationRepository.findById({ id });
    if (!conversation || !SupportAccessHelper.canAccess({ conversation, userId: actorId, role })) {
      throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);
    }

    const rows = await this.messageRepository.listThread({ ...page, conversationId: id, actorId });

    return this.attachments.toContracts({ rows });
  }
}

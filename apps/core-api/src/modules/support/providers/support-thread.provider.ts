import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AnnounceMessagesDto } from '../dtos/stream/announce-messages.dto';
import { ReadConversationDto } from '../dtos/input/read-conversation.dto';
import { SUPPORT } from '../constants/chat/support.constant';
import { SUPPORT_EVENTS } from '../constants/chat/support-events.constant';
import { SupportAccessHelper } from '../helpers/support-access.helper';
import { SupportConversationDto } from '../dtos/conversation/support-conversation.dto';
import { SupportConversationRepository } from '../repositories/support-conversation.repository';
import { SupportStreamProvider } from './support-stream.provider';

@Injectable()
export class SupportThreadProvider {
  constructor (
    private readonly conversationRepository: SupportConversationRepository,
    private readonly stream: SupportStreamProvider
  ) {}

  async requireOpen ({ conversationId, userId, role }: ReadConversationDto): Promise<SupportConversationDto> {
    const conversation = await this.conversationRepository.findById({ id: conversationId });

    if (!conversation || !SupportAccessHelper.canAccess({ conversation, userId, role })) throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);
    if (conversation.status !== SUPPORT.OPEN_STATUS) throw new BadRequestException(SUPPORT.CLOSED_MESSAGE);

    return conversation;
  }

  async announce ({ type, conversation, senderUserId, role, messages }: AnnounceMessagesDto): Promise<void> {
    const staff = SupportAccessHelper.isStaff({ role });

    if (type === SUPPORT_EVENTS.MESSAGE_CREATED) await this.conversationRepository.touch({ conversationId: conversation.id });
    if (staff) await this.conversationRepository.claim({ conversationId: conversation.id, staffUserId: senderUserId });

    const assignedStaffId = conversation.assignedStaffId ?? (staff ? senderUserId : null);

    messages.forEach(message =>
      this.stream.broadcast({ type, conversationId: conversation.id, customerUserId: conversation.customerUserId, assignedStaffId, message })
    );
  }
}

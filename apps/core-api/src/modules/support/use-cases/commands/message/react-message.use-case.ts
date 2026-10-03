import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { MESSAGE_REACTION } from '../../../constants/chat/message-reaction.constant';
import { ReactMessageDto } from '../../../dtos/input/react-message.dto';
import { ReactionDto } from '../../../dtos/message/reaction.dto';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportReactionRepository } from '../../../repositories/support-reaction.repository';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class ReactMessageUseCase {
  constructor (
    private readonly messageRepository: SupportMessageRepository,
    private readonly reactionRepository: SupportReactionRepository,
    private readonly thread: SupportThreadProvider,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute ({ conversationId, messageId, userId, role, emoji }: ReactMessageDto): Promise<ReactionDto[]> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const message = await this.messageRepository.findById({ id: messageId });
    if (message?.conversationId !== conversationId) throw new NotFoundException(MESSAGE_REACTION.NOT_FOUND_MESSAGE);
    if (message.deletedAt) throw new BadRequestException(MESSAGE_REACTION.DELETED_MESSAGE);

    if (emoji) await this.reactionRepository.set({ messageId, userId, emoji });
    else await this.reactionRepository.clear({ messageId, userId });

    const reactions = await this.reactionRepository.listFor({ messageId });
    this.stream.broadcast({
      type: SUPPORT_EVENTS.MESSAGE_REACTED,
      conversationId,
      customerUserId: conversation.customerUserId,
      assignedStaffId: conversation.assignedStaffId,
      messageId,
      reactions
    });

    return reactions;
  }
}

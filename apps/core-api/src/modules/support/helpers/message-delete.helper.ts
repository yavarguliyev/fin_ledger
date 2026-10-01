import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupportDeleteScope } from '@common/libs';

import { DeletableMessageDto } from '../dtos/input/deletable-message.dto';
import { MessageEditHelper } from './message-edit.helper';
import { SUPPORT_ATTACHMENT } from '../constants/attachment/support-attachment.constant';
import { SUPPORT_MESSAGE_RULES } from '../constants/chat/support-message-rules.constant';
import { SupportMessageDto } from '../dtos/message/support-message.dto';

export class MessageDeleteHelper {
  static assertDeletable ({ existing, conversationId, userId, scope }: DeletableMessageDto): SupportMessageDto {
    if (!existing || existing.conversationId !== conversationId) throw new NotFoundException(SUPPORT_ATTACHMENT.MESSAGE_NOT_FOUND_MESSAGE);
    if (existing.senderUserId !== userId) throw new ForbiddenException(SUPPORT_MESSAGE_RULES.NOT_YOUR_MESSAGE_DELETE);
    if (scope === SupportDeleteScope.ME) return existing;

    if (existing.deletedAt) throw new BadRequestException(SUPPORT_MESSAGE_RULES.ALREADY_DELETED_MESSAGE);
    if (MessageEditHelper.olderThan({ message: existing, windowMs: SUPPORT_MESSAGE_RULES.DELETE_FOR_EVERYONE_WINDOW_MS })) {
      throw new BadRequestException(SUPPORT_MESSAGE_RULES.DELETE_EXPIRED_MESSAGE);
    }

    return existing;
  }
}

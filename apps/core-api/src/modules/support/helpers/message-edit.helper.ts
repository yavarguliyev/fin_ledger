import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { EditableMessageDto } from '../dtos/input/editable-message.dto';
import { SUPPORT_ATTACHMENT } from '../constants/attachment/support-attachment.constant';
import { MessageAgeDto } from '../dtos/message/message-age.dto';
import { SUPPORT_MESSAGE_RULES } from '../constants/chat/support-message-rules.constant';
import { SupportMessageDto } from '../dtos/message/support-message.dto';

export class MessageEditHelper {
  static assertEditable ({ existing, conversationId, userId, body, hasFile }: EditableMessageDto): SupportMessageDto {
    if (!existing || existing.conversationId !== conversationId || existing.deletedAt) {
      throw new NotFoundException(SUPPORT_ATTACHMENT.MESSAGE_NOT_FOUND_MESSAGE);
    }

    if (existing.senderUserId !== userId) throw new ForbiddenException(SUPPORT_ATTACHMENT.NOT_YOUR_MESSAGE);
    if (SUPPORT_ATTACHMENT.RECORDED_KINDS.includes(existing.kind)) {
      throw new BadRequestException(SUPPORT_ATTACHMENT.NOT_EDITABLE_MESSAGE);
    }
    if (MessageEditHelper.olderThan({ message: existing, windowMs: SUPPORT_MESSAGE_RULES.EDIT_WINDOW_MS })) {
      throw new BadRequestException(SUPPORT_MESSAGE_RULES.EDIT_EXPIRED_MESSAGE);
    }

    if (body === undefined && !hasFile) throw new BadRequestException(SUPPORT_ATTACHMENT.NOTHING_TO_EDIT_MESSAGE);

    const text = MessageEditHelper.nextBody({ existing, conversationId, userId, ...(body !== undefined && { body }), hasFile });
    if (!text && !hasFile && !existing.storageKey) throw new BadRequestException(SUPPORT_ATTACHMENT.NOTHING_TO_EDIT_MESSAGE);

    return existing;
  }

  static olderThan ({ message, windowMs }: MessageAgeDto): boolean {
    return Date.now() - new Date(message.createdAt).getTime() > windowMs;
  }

  static nextBody ({ existing, body }: EditableMessageDto): string | null {
    return body === undefined ? (existing?.body ?? null) : body.trim() || null;
  }
}

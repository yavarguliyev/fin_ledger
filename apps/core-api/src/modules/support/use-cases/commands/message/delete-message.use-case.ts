import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportDeleteScope } from '@common/libs';

import { DeleteMessageDto } from '../../../dtos/input/delete-message.dto';
import { MessageDeleteHelper } from '../../../helpers/message-delete.helper';
import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { SUPPORT_ATTACHMENT } from '../../../constants/attachment/support-attachment.constant';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class DeleteMessageUseCase {
  constructor (
    private readonly messageRepository: SupportMessageRepository,
    private readonly attachments: SupportAttachmentProvider,
    private readonly thread: SupportThreadProvider
  ) {}

  async execute ({ conversationId, messageId, userId, role, scope }: DeleteMessageDto): Promise<OkResponseDto> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const found = await this.messageRepository.findById({ id: messageId });
    const existing = MessageDeleteHelper.assertDeletable({ existing: found, conversationId, userId, scope });

    if (scope === SupportDeleteScope.ME) {
      await this.messageRepository.hideForUser({ messageId, userId });
      return OK_RESPONSE;
    }

    const row = await this.messageRepository.deleteForEveryone({ messageId });
    if (!row) throw new NotFoundException(SUPPORT_ATTACHMENT.MESSAGE_NOT_FOUND_MESSAGE);

    if (existing.storageKey) await this.attachments.remove({ storageKey: existing.storageKey });

    const message = await this.attachments.toContract({ row });
    await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_UPDATED, conversation, senderUserId: userId, role, messages: [message] });

    return OK_RESPONSE;
  }
}

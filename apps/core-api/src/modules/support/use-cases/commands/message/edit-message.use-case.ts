import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportMessageContract } from '@common/contracts';

import { EditMessageDto } from '../../../dtos/input/edit-message.dto';
import { MessageEditHelper } from '../../../helpers/message-edit.helper';
import { SUPPORT_ATTACHMENT } from '../../../constants/attachment/support-attachment.constant';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class EditMessageUseCase {
  constructor (
    private readonly messageRepository: SupportMessageRepository,
    private readonly attachments: SupportAttachmentProvider,
    private readonly thread: SupportThreadProvider
  ) {}

  async execute ({ conversationId, messageId, userId, role, body, file }: EditMessageDto): Promise<SupportMessageContract> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const found = await this.messageRepository.findById({ id: messageId });
    const check = { existing: found, conversationId, userId, ...(body !== undefined && { body }), hasFile: !!file };
    const existing = MessageEditHelper.assertEditable(check);
    const text = MessageEditHelper.nextBody(check);

    const attachment = file ? await this.attachments.store({ conversationId, file }) : null;
    const row = await this.messageRepository.edit({ id: messageId, body: text, attachment });
    if (!row) throw new NotFoundException(SUPPORT_ATTACHMENT.MESSAGE_NOT_FOUND_MESSAGE);

    if (attachment && existing.storageKey) await this.attachments.remove({ storageKey: existing.storageKey });

    const message = await this.attachments.toContract({ row });
    await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_UPDATED, conversation, senderUserId: userId, role, messages: [message] });

    return message;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { SupportMessageSource } from '@common/libs';
import { SupportMessageContract } from '@common/contracts';

import { SendAttachmentsDto } from '../../../dtos/input/send-attachments.dto';
import { SUPPORT_ATTACHMENT } from '../../../constants/attachment/support-attachment.constant';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportMessageDto } from '../../../dtos/message/support-message.dto';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class SendAttachmentsUseCase {
  constructor (
    private readonly messageRepository: SupportMessageRepository,
    private readonly attachments: SupportAttachmentProvider,
    private readonly thread: SupportThreadProvider
  ) {}

  async execute ({ conversationId, senderUserId, role, body, durationSeconds, files }: SendAttachmentsDto): Promise<SupportMessageContract[]> {
    if (files.length === 0) throw new BadRequestException(SUPPORT_ATTACHMENT.NO_FILES_MESSAGE);
    if (files.length > SUPPORT_ATTACHMENT.MAX_FILES) throw new BadRequestException(SUPPORT_ATTACHMENT.TOO_MANY_FILES_MESSAGE);

    const conversation = await this.thread.requireOpen({ conversationId, userId: senderUserId, role });
    this.attachments.assertAllowed({ files });

    const caption = body?.trim() || null;
    const rows: SupportMessageDto[] = [];

    for (const [index, file] of files.entries()) {
      const stored = await this.attachments.store({ conversationId, file });
      const row = await this.messageRepository.addAttachment({
        ...stored,
        conversationId,
        senderUserId,
        source: SupportMessageSource.WEB,
        body: index === 0 ? caption : null,
        durationSeconds: files.length === 1 ? (durationSeconds ?? null) : null
      });

      if (row) rows.push(row);
    }

    const messages = await this.attachments.toContracts({ rows });
    await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_CREATED, conversation, senderUserId, role, messages });

    return messages;
  }
}

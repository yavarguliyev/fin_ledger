import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { DownloadUrlResponseDto } from '../../../dtos/response/download-url-response.dto';
import { MessageAccessDto } from '../../../dtos/input/message-access.dto';
import { SUPPORT_PRIVACY } from '../../../constants/chat/support-privacy.constant';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';

@Injectable()
export class GetDownloadUrlUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly messageRepository: SupportMessageRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute ({ conversationId, messageId, userId, role }: MessageAccessDto): Promise<DownloadUrlResponseDto> {
    const conversation = await this.access.require({ conversationId, userId, role });
    const message = await this.messageRepository.findById({ id: messageId });

    if (message?.conversationId !== conversationId || !message.storageKey || message.deletedAt) throw new NotFoundException(SUPPORT_PRIVACY.NO_FILE_MESSAGE);
    if (conversation.privacyEnabled && message.senderUserId !== userId) throw new ForbiddenException(SUPPORT_PRIVACY.DOWNLOAD_BLOCKED_MESSAGE);

    return { url: await this.attachments.downloadUrl({ storageKey: message.storageKey, fileName: message.fileName }) };
  }
}

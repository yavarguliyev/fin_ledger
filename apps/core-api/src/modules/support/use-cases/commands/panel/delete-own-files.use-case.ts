import { Injectable } from '@nestjs/common';

import { DeletedFilesResponseDto } from '../../../dtos/response/deleted-files-response.dto';
import { DeleteOwnFilesDto } from '../../../dtos/input/delete-own-files.dto';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportPanelRepository } from '../../../repositories/support-panel.repository';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class DeleteOwnFilesUseCase {
  constructor (
    private readonly panelRepository: SupportPanelRepository,
    private readonly attachments: SupportAttachmentProvider,
    private readonly thread: SupportThreadProvider
  ) {}

  async execute ({ conversationId, userId, role, messageIds }: DeleteOwnFilesDto): Promise<DeletedFilesResponseDto> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const rows = await this.panelRepository.deleteOwnFiles({ conversationId, userId, messageIds });
    if (!rows.length) return { deleted: 0 };

    await Promise.all(rows.map(row => this.attachments.remove({ storageKey: row.removedKey })));
    const messages = await this.attachments.toContracts({ rows });
    await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_UPDATED, conversation, senderUserId: userId, role, messages });

    return { deleted: rows.length };
  }
}

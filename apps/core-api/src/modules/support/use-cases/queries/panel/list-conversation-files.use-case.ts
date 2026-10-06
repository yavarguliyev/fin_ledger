import { Injectable } from '@nestjs/common';
import { SupportMessageContract } from '@common/contracts';

import { PanelFilesDto } from '../../../dtos/input/panel-files.dto';
import { SUPPORT_PANEL } from '../../../constants/chat/support-panel.constant';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportPanelRepository } from '../../../repositories/support-panel.repository';

@Injectable()
export class ListConversationFilesUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly panelRepository: SupportPanelRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute ({ conversationId, userId, role, kinds, limit, before, beforeId }: PanelFilesDto): Promise<SupportMessageContract[]> {
    await this.access.require({ conversationId, userId, role });

    const rows = await this.panelRepository.files({
      conversationId,
      userId,
      kinds,
      limit: limit ?? SUPPORT_PANEL.PAGE_SIZE,
      ...(before && { before }),
      ...(beforeId && { beforeId })
    });

    return this.attachments.toContracts({ rows });
  }
}

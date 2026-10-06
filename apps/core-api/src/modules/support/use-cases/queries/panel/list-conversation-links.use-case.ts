import { Injectable } from '@nestjs/common';

import { MessageLinkDto } from '../../../dtos/message/message-link.dto';
import { PanelPageDto } from '../../../dtos/input/panel-page.dto';
import { SUPPORT_PANEL } from '../../../constants/chat/support-panel.constant';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportPanelRepository } from '../../../repositories/support-panel.repository';

@Injectable()
export class ListConversationLinksUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly panelRepository: SupportPanelRepository
  ) {}

  async execute ({ conversationId, userId, role, limit, before, beforeId }: PanelPageDto): Promise<MessageLinkDto[]> {
    await this.access.require({ conversationId, userId, role });

    return this.panelRepository.links({
      conversationId,
      userId,
      limit: limit ?? SUPPORT_PANEL.PAGE_SIZE,
      ...(before && { before }),
      ...(beforeId && { beforeId })
    });
  }
}

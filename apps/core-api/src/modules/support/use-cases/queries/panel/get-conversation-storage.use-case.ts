import { Injectable } from '@nestjs/common';

import { ReadConversationDto } from '../../../dtos/input/read-conversation.dto';
import { StorageSummaryResponseDto } from '../../../dtos/response/storage-summary-response.dto';
import { SUPPORT_PANEL } from '../../../constants/chat/support-panel.constant';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportPanelRepository } from '../../../repositories/support-panel.repository';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';

@Injectable()
export class GetConversationStorageUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly panelRepository: SupportPanelRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute ({ conversationId, userId, role }: ReadConversationDto): Promise<StorageSummaryResponseDto> {
    const conversation = await this.access.require({ conversationId, userId, role });
    const totals = (await this.panelRepository.storageTotals({ conversationId, userId })) ?? SUPPORT_PANEL.EMPTY_TOTALS;
    const rows = await this.panelRepository.storageFiles({ conversationId, userId });
    const files = await Promise.all(rows.map(async ({ storageKey, ...file }) => ({ ...file, url: await this.attachments.inlineUrl({ storageKey }) })));

    if (!SupportAccessHelper.isStaff({ role })) return { ...totals, files };

    const customer = await this.panelRepository.customerTotal({ userId: conversation.customerUserId });
    return { ...totals, customerTotalBytes: customer?.totalBytes ?? SUPPORT_PANEL.NO_BYTES, files };
  }
}

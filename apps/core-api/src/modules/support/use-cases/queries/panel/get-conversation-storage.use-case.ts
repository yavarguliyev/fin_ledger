import { Injectable } from '@nestjs/common';

import { ReadConversationDto } from '../../../dtos/input/read-conversation.dto';
import { StorageSummaryResponseDto } from '../../../dtos/response/storage-summary-response.dto';
import { SUPPORT_PANEL } from '../../../constants/chat/support-panel.constant';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportPanelRepository } from '../../../repositories/support-panel.repository';

@Injectable()
export class GetConversationStorageUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly panelRepository: SupportPanelRepository
  ) {}

  async execute ({ conversationId, userId, role }: ReadConversationDto): Promise<StorageSummaryResponseDto> {
    const conversation = await this.access.require({ conversationId, userId, role });
    const totals = (await this.panelRepository.storageTotals({ conversationId, userId })) ?? SUPPORT_PANEL.EMPTY_TOTALS;
    const files = await this.panelRepository.storageFiles({ conversationId, userId });

    if (!SupportAccessHelper.isStaff({ role })) return { ...totals, files };

    const customer = await this.panelRepository.customerTotal({ userId: conversation.customerUserId });
    return { ...totals, customerTotalBytes: customer?.totalBytes ?? SUPPORT_PANEL.NO_BYTES, files };
  }
}

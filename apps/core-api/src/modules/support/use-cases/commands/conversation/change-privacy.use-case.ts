import { Injectable } from '@nestjs/common';
import { SupportMessageKind, SupportMessageSource } from '@common/libs';

import { ChangePrivacyDto } from '../../../dtos/input/change-privacy.dto';
import { PrivacyResponseDto } from '../../../dtos/response/privacy-response.dto';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SUPPORT_PRIVACY } from '../../../constants/chat/support-privacy.constant';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';
import { SupportMapperHelper } from '../../../helpers/support-mapper.helper';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class ChangePrivacyUseCase {
  constructor (
    private readonly thread: SupportThreadProvider,
    private readonly conversationRepository: SupportConversationRepository,
    private readonly messageRepository: SupportMessageRepository,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute ({ conversationId, userId, role, enabled }: ChangePrivacyDto): Promise<PrivacyResponseDto> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const changed = await this.conversationRepository.setPrivacy({ conversationId, userId, enabled });
    if (!changed) return { privacyEnabled: enabled };

    const row = await this.messageRepository.add({
      conversationId,
      senderUserId: userId,
      kind: SupportMessageKind.SYSTEM,
      source: SupportMessageSource.SYSTEM,
      body: enabled ? SUPPORT_PRIVACY.ON_NOTICE : SUPPORT_PRIVACY.OFF_NOTICE
    });

    if (row) await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_CREATED, conversation, senderUserId: userId, role, messages: [SupportMapperHelper.toMessage({ row })] });

    this.stream.broadcast({
      type: SUPPORT_EVENTS.CONVERSATION_UPDATED,
      conversationId,
      customerUserId: conversation.customerUserId,
      assignedStaffId: conversation.assignedStaffId,
      privacyEnabled: enabled
    });

    return { privacyEnabled: enabled };
  }
}

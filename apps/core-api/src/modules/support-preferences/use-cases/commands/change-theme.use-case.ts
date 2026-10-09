import { Injectable } from '@nestjs/common';
import { SupportMessageKind, SupportMessageSource } from '@common/libs';

import { SUPPORT_EVENTS, SupportMapperHelper, SupportMessageRepository, SupportStreamProvider, SupportThreadProvider } from '../../../support';
import { SUPPORT_PREFERENCES } from '../../constants/support-preferences.constant';
import { SupportPreferencesRepository } from '../../repositories/support-preferences.repository';
import { ThemeConversationDto } from '../../dtos/input/theme-conversation.dto';
import { ThemeResponseDto } from '../../dtos/response/theme-response.dto';

@Injectable()
export class ChangeThemeUseCase {
  constructor (
    private readonly thread: SupportThreadProvider,
    private readonly preferencesRepository: SupportPreferencesRepository,
    private readonly messageRepository: SupportMessageRepository,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute ({ conversationId, userId, role, theme }: ThemeConversationDto): Promise<ThemeResponseDto> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const changed = await this.preferencesRepository.setTheme({ conversationId, userId, role, theme });

    const row = await this.messageRepository.add({
      conversationId,
      senderUserId: userId,
      kind: SupportMessageKind.SYSTEM,
      source: SupportMessageSource.SYSTEM,
      body: SUPPORT_PREFERENCES.THEME_NOTICE
    });
    if (row) await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_CREATED, conversation, senderUserId: userId, role, messages: [SupportMapperHelper.toMessage({ row })] });

    this.stream.broadcast({
      type: SUPPORT_EVENTS.CONVERSATION_UPDATED,
      conversationId,
      customerUserId: conversation.customerUserId,
      assignedStaffId: conversation.assignedStaffId,
      themeChanged: true
    });
    return changed;
  }
}

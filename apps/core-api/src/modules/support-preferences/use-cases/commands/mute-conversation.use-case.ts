import { Injectable } from '@nestjs/common';

import { MuteConversationDto } from '../../dtos/input/mute-conversation.dto';
import { PreferencesResponseDto } from '../../dtos/response/preferences-response.dto';
import { SupportAccessProvider } from '../../../support';
import { SupportPreferencesRepository } from '../../repositories/support-preferences.repository';
import { SUPPORT_PREFERENCES } from '../../constants/support-preferences.constant';

@Injectable()
export class MuteConversationUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly preferencesRepository: SupportPreferencesRepository
  ) {}

  async execute (dto: MuteConversationDto): Promise<PreferencesResponseDto> {
    await this.access.requireMember(dto);
    return this.preferencesRepository.mute({ conversationId: dto.conversationId, userId: dto.userId, seconds: SUPPORT_PREFERENCES.MUTE_SECONDS[dto.duration] });
  }
}

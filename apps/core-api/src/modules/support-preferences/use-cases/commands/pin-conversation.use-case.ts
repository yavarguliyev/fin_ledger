import { ConflictException, Injectable } from '@nestjs/common';

import { PinConversationDto } from '../../dtos/input/pin-conversation.dto';
import { PreferencesResponseDto } from '../../dtos/response/preferences-response.dto';
import { SupportAccessProvider } from '../../../support';
import { SupportPreferencesRepository } from '../../repositories/support-preferences.repository';
import { SUPPORT_PREFERENCES } from '../../constants/support-preferences.constant';

@Injectable()
export class PinConversationUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly preferencesRepository: SupportPreferencesRepository
  ) {}

  async execute (dto: PinConversationDto): Promise<PreferencesResponseDto> {
    await this.access.requireMember(dto);
    if (dto.pinned && (await this.preferencesRepository.otherPins(dto)) >= SUPPORT_PREFERENCES.PIN_LIMIT) throw new ConflictException(SUPPORT_PREFERENCES.PIN_LIMIT_MESSAGE);
    return this.preferencesRepository.pin(dto);
  }
}

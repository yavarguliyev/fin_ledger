import { Injectable } from '@nestjs/common';

import { FavouriteConversationDto } from '../../dtos/input/favourite-conversation.dto';
import { PreferencesResponseDto } from '../../dtos/response/preferences-response.dto';
import { SupportAccessProvider } from '../../../support';
import { SupportPreferencesRepository } from '../../repositories/support-preferences.repository';

@Injectable()
export class FavouriteConversationUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly preferencesRepository: SupportPreferencesRepository
  ) {}

  async execute (dto: FavouriteConversationDto): Promise<PreferencesResponseDto> {
    await this.access.requireMember(dto);
    return this.preferencesRepository.favourite(dto);
  }
}

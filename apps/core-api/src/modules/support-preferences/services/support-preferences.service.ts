import { Injectable } from '@nestjs/common';

import { ChangeThemeUseCase } from '../use-cases/commands/change-theme.use-case';
import { FavouriteConversationDto } from '../dtos/input/favourite-conversation.dto';
import { FavouriteConversationUseCase } from '../use-cases/commands/favourite-conversation.use-case';
import { MuteConversationDto } from '../dtos/input/mute-conversation.dto';
import { MuteConversationUseCase } from '../use-cases/commands/mute-conversation.use-case';
import { PinConversationDto } from '../dtos/input/pin-conversation.dto';
import { PinConversationUseCase } from '../use-cases/commands/pin-conversation.use-case';
import { PreferencesResponseDto } from '../dtos/response/preferences-response.dto';
import { ThemeResponseDto } from '../dtos/response/theme-response.dto';
import { ThemeConversationDto } from '../dtos/input/theme-conversation.dto';

@Injectable()
export class SupportPreferencesService {
  constructor (
    private readonly muteConversationUseCase: MuteConversationUseCase,
    private readonly pinConversationUseCase: PinConversationUseCase,
    private readonly favouriteConversationUseCase: FavouriteConversationUseCase,
    private readonly changeThemeUseCase: ChangeThemeUseCase
  ) {}

  async mute (dto: MuteConversationDto): Promise<PreferencesResponseDto> {
    return this.muteConversationUseCase.execute(dto);
  }

  async pin (dto: PinConversationDto): Promise<PreferencesResponseDto> {
    return this.pinConversationUseCase.execute(dto);
  }

  async favourite (dto: FavouriteConversationDto): Promise<PreferencesResponseDto> {
    return this.favouriteConversationUseCase.execute(dto);
  }

  async theme (dto: ThemeConversationDto): Promise<ThemeResponseDto> {
    return this.changeThemeUseCase.execute(dto);
  }
}

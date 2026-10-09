import { Module } from '@nestjs/common';

import { ChangeThemeUseCase } from './use-cases/commands/change-theme.use-case';
import { FavouriteConversationUseCase } from './use-cases/commands/favourite-conversation.use-case';
import { MuteConversationUseCase } from './use-cases/commands/mute-conversation.use-case';
import { PinConversationUseCase } from './use-cases/commands/pin-conversation.use-case';
import { SharedModule } from '../../shared/shared.module';
import { SupportModule } from '../support/support.module';
import { SupportPreferencesController } from './controllers/support-preferences.controller';
import { SupportPreferencesRepository } from './repositories/support-preferences.repository';
import { SupportPreferencesService } from './services/support-preferences.service';

@Module({
  imports: [SharedModule, SupportModule],
  controllers: [SupportPreferencesController],
  providers: [SupportPreferencesService, SupportPreferencesRepository, MuteConversationUseCase, PinConversationUseCase, FavouriteConversationUseCase, ChangeThemeUseCase]
})
export class SupportPreferencesModule {}

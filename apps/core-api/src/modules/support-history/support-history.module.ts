import { Module } from '@nestjs/common';

import { ClearChatUseCase } from './use-cases/commands/clear-chat.use-case';
import { DeleteMessagesUseCase } from './use-cases/commands/delete-messages.use-case';
import { SharedModule } from '../../shared/shared.module';
import { SupportHistoryController } from './controllers/support-history.controller';
import { SupportHistoryRepository } from './repositories/support-history.repository';
import { SupportHistoryService } from './services/support-history.service';
import { SupportModule } from '../support/support.module';

@Module({
  imports: [SharedModule, SupportModule],
  controllers: [SupportHistoryController],
  providers: [SupportHistoryService, SupportHistoryRepository, ClearChatUseCase, DeleteMessagesUseCase]
})
export class SupportHistoryModule {}

import { Module } from '@nestjs/common';

import { ListPinsUseCase } from './use-cases/queries/list-pins.use-case';
import { PinMessageUseCase } from './use-cases/commands/pin-message.use-case';
import { SharedModule } from '../../shared/shared.module';
import { SupportModule } from '../support/support.module';
import { SupportPinsController } from './controllers/support-pins.controller';
import { SupportPinsRepository } from './repositories/support-pins.repository';
import { SupportPinsService } from './services/support-pins.service';
import { UnpinMessageUseCase } from './use-cases/commands/unpin-message.use-case';

@Module({
  imports: [SharedModule, SupportModule],
  controllers: [SupportPinsController],
  providers: [SupportPinsService, SupportPinsRepository, ListPinsUseCase, PinMessageUseCase, UnpinMessageUseCase]
})
export class SupportPinsModule {}

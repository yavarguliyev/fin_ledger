import { Module } from '@nestjs/common';

import { GameEventsController } from './game-events.controller';
import { GameEventsService } from './game-events.service';
import { GameEventRepository } from './repositories/game-event.repository';
import { GetGameEventsUseCase } from './use-cases/queries/get-game-events.use-case';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [GameEventsController],
  providers: [GameEventsService, GameEventRepository, GetGameEventsUseCase],
  exports: [GameEventsService]
})
export class GameEventsModule {}

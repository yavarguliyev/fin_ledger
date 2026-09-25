import { Module } from '@nestjs/common';

import { GameEventsController } from './game-events.controller';
import { GameEventsService } from './game-events.service';
import { GameEventRepository } from './repositories/game-event.repository';
import { GetGameEventsUseCase } from './use-cases/queries/get-game-events.use-case';
import { CreateGameEventUseCase } from './use-cases/commands/create-game-event.use-case';
import { ChangeGameEventStatusUseCase } from './use-cases/commands/change-game-event-status.use-case';
import { RecordGameEventResultUseCase } from './use-cases/commands/record-game-event-result.use-case';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [GameEventsController],
  providers: [GameEventsService, GameEventRepository, GetGameEventsUseCase, CreateGameEventUseCase, ChangeGameEventStatusUseCase, RecordGameEventResultUseCase],
  exports: [GameEventsService, GameEventRepository]
})
export class GameEventsModule {}

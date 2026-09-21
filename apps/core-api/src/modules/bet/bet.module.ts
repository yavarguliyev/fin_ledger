import { Module } from '@nestjs/common';

import { BetController } from './bet.controller';
import { BetService } from './bet.service';
import { BetRepository } from './repositories/bet.repository';
import { PlaceBetUseCase } from './use-cases/commands/place-bet.use-case';
import { SettleBetUseCase } from './use-cases/commands/settle-bet.use-case';
import { GetBetsUseCase } from './use-cases/queries/get-bets.use-case';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { GameEventsModule } from '../game-events/game-events.module';
import { NotificationModule } from '../notification/notification.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [SharedModule, AuthModule, GameEventsModule, NotificationModule, WalletModule],
  controllers: [BetController],
  providers: [BetService, BetRepository, PlaceBetUseCase, SettleBetUseCase, GetBetsUseCase],
  exports: [BetService, BetRepository]
})
export class BetModule {}

import { Inject } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { BetRepository } from '../../repositories/bet.repository';
import { GameEventRepository } from '../../../game-events/repositories/game-event.repository';
import { WalletService } from '../../../wallet/wallet.service';

export abstract class BetBaseUseCase<TInput, TOutput> {
  @Inject(PostgresService)
  protected readonly postgresService!: PostgresService;

  @Inject(BetRepository)
  protected readonly betRepository!: BetRepository;

  @Inject(GameEventRepository)
  protected readonly gameEventRepository!: GameEventRepository;

  @Inject(WalletService)
  protected readonly walletService!: WalletService;

  abstract execute(input: TInput): Promise<TOutput>;
}

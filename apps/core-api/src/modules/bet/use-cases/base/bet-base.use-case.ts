import { Inject } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { BetRepository } from '../../repositories/bet.repository';
import { GameEventRepository } from '../../../game-events';
import { WalletService } from '../../../wallet';
import { AuthRepository } from '../../../auth';

export abstract class BetBaseUseCase<TInput, TOutput> {
  @Inject(PostgresService)
  protected readonly postgresService!: PostgresService;

  @Inject(BetRepository)
  protected readonly betRepository!: BetRepository;

  @Inject(GameEventRepository)
  protected readonly gameEventRepository!: GameEventRepository;

  @Inject(WalletService)
  protected readonly walletService!: WalletService;

  @Inject(AuthRepository)
  protected readonly authRepository!: AuthRepository;

  abstract execute(input: TInput): Promise<TOutput>;
}

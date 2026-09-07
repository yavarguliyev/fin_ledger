import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, DatabaseAdapter, REDIS_CACHE_PROVIDER, RedisCacheProvider, WalletStatus } from '@common/libs';

import { CreateWalletUseCase } from './use-cases/commands/wallet/create-wallet.use-case';
import { GetWalletUseCase } from './use-cases/queries/get-wallet.use-case';
import { GetWalletByUserIdUseCase } from './use-cases/queries/get-wallet-by-user-id.use-case';
import { CreditWalletUseCase } from './use-cases/commands/wallet/credit-wallet.use-case';
import { DebitWalletUseCase } from './use-cases/commands/wallet/debit-wallet.use-case';
import { ReserveFundsUseCase } from './use-cases/commands/funds/reserve-funds.use-case';
import { ReleaseFundsUseCase } from './use-cases/commands/funds/release-funds.use-case';
import { PlaceBetUseCase } from './use-cases/commands/wallet/place-bet.use-case';
import { SettleWinningsUseCase } from './use-cases/commands/wallet/settle-winnings.use-case';
import { UpdateWalletStatusUseCase } from './use-cases/commands/wallet/update-wallet-status.use-case';
import { PlaceBetInput } from './dtos/betting/place-bet.dto';
import { SettleWinningsDto } from './dtos/betting/settle-winnings.dto';
import { CreditDebitDto } from './dtos/balance-operation/credit-debit.dto';
import { WalletDto } from './dtos/wallet/wallet.dto';
import { CreateWalletDto } from './dtos/wallet/wallet-create.dto';

@Injectable()
export class WalletService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly getWalletByUserIdUseCase: GetWalletByUserIdUseCase,
    private readonly creditWalletUseCase: CreditWalletUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase,
    private readonly reserveFundsUseCase: ReserveFundsUseCase,
    private readonly releaseFundsUseCase: ReleaseFundsUseCase,
    private readonly placeBetUseCase: PlaceBetUseCase,
    private readonly settleWinningsUseCase: SettleWinningsUseCase,
    private readonly updateWalletStatusUseCase: UpdateWalletStatusUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @Cacheable({ keyPrefix: 'wallet', ttlSeconds: 60 })
  async getWallet (id: string): Promise<WalletDto | null> {
    return this.getWalletUseCase.execute(id);
  }

  @Cacheable({ keyPrefix: 'wallet:user', ttlSeconds: 300 })
  async getWalletByUserId (userId: string): Promise<WalletDto | null> {
    return this.getWalletByUserIdUseCase.execute(userId);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async createWallet (input: CreateWalletDto): Promise<WalletDto> {
    return this.createWalletUseCase.execute(input);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async creditWallet (dto: CreditDebitDto & { walletId: string; adapter?: DatabaseAdapter }): Promise<WalletDto> {
    return this.creditWalletUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async debitWallet (dto: CreditDebitDto & { walletId: string; adapter?: DatabaseAdapter }): Promise<WalletDto> {
    return this.debitWalletUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async placeBet (dto: PlaceBetInput): Promise<WalletDto> {
    return this.placeBetUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async settleWinnings (dto: SettleWinningsDto & { walletId: string; adapter?: DatabaseAdapter }): Promise<WalletDto> {
    return this.settleWinningsUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async reserveFunds (walletId: string, amountMinor: number, adapter?: DatabaseAdapter): Promise<WalletDto> {
    return this.reserveFundsUseCase.execute({ walletId, amountMinor, adapter });
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async releaseFunds (walletId: string, amountMinor: number, adapter?: DatabaseAdapter): Promise<WalletDto> {
    return this.releaseFundsUseCase.execute({ walletId, amountMinor, adapter });
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async updateWalletStatus (walletId: string, status: WalletStatus): Promise<WalletDto> {
    return this.updateWalletStatusUseCase.execute({ walletId, status });
  }
}

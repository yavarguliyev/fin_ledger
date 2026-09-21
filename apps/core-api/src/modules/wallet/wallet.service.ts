import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { CreateWalletUseCase } from './use-cases/commands/wallet/create-wallet.use-case';
import { GetWalletUseCase } from './use-cases/queries/get-wallet.use-case';
import { GetUserWalletsUseCase } from './use-cases/queries/get-user-wallets.use-case';
import { GetWalletByCurrencyUseCase } from './use-cases/queries/get-wallet-by-currency.use-case';
import { GetOpenableCurrenciesUseCase } from './use-cases/queries/get-openable-currencies.use-case';
import { OpenWalletUseCase } from './use-cases/commands/wallet/open-wallet.use-case';
import { CreditWalletUseCase } from './use-cases/commands/wallet/credit-wallet.use-case';
import { DebitWalletUseCase } from './use-cases/commands/wallet/debit-wallet.use-case';
import { ReserveFundsUseCase } from './use-cases/commands/funds/reserve-funds.use-case';
import { ReleaseFundsUseCase } from './use-cases/commands/funds/release-funds.use-case';
import { CaptureReservedFundsUseCase } from './use-cases/commands/funds/capture-reserved-funds.use-case';
import { PlaceBetUseCase } from './use-cases/commands/wallet/place-bet.use-case';
import { SettleWinningsUseCase } from './use-cases/commands/wallet/settle-winnings.use-case';
import { UpdateWalletStatusUseCase } from './use-cases/commands/wallet/update-wallet-status.use-case';
import { WalletDto } from './dtos/wallet/wallet.dto';
import { WalletOperationResultDto } from './dtos/transaction/wallet-operation-result.dto';
import { CreateWalletDto } from './dtos/input/create-wallet.dto';
import { OpenWalletDto } from './dtos/input/open-wallet.dto';
import { UserWalletsDto } from './dtos/input/user-wallets.dto';
import { WalletByCurrencyDto } from './dtos/input/wallet-by-currency.dto';
import { WalletOperationDto } from './dtos/input/wallet-operation.dto';
import { FundsOperationDto } from './dtos/input/funds-operation.dto';
import { WalletIdRequestDto } from './dtos/request/wallet-id-request.dto';
import { UpdateWalletStatusDto } from './dtos/request/update-wallet-status.dto';

@Injectable()
export class WalletService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly getUserWalletsUseCase: GetUserWalletsUseCase,
    private readonly getWalletByCurrencyUseCase: GetWalletByCurrencyUseCase,
    private readonly getOpenableCurrenciesUseCase: GetOpenableCurrenciesUseCase,
    private readonly openWalletUseCase: OpenWalletUseCase,
    private readonly creditWalletUseCase: CreditWalletUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase,
    private readonly reserveFundsUseCase: ReserveFundsUseCase,
    private readonly releaseFundsUseCase: ReleaseFundsUseCase,
    private readonly captureReservedFundsUseCase: CaptureReservedFundsUseCase,
    private readonly placeBetUseCase: PlaceBetUseCase,
    private readonly settleWinningsUseCase: SettleWinningsUseCase,
    private readonly updateWalletStatusUseCase: UpdateWalletStatusUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @Cacheable({ keyPrefix: 'wallet', ttlSeconds: 60 })
  async getWallet (dto: WalletIdRequestDto): Promise<WalletDto | null> {
    return this.getWalletUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'wallet:user', ttlSeconds: 60 })
  async getUserWallets (dto: UserWalletsDto): Promise<WalletDto[]> {
    return this.getUserWalletsUseCase.execute(dto);
  }

  async getWalletByCurrency (dto: WalletByCurrencyDto): Promise<WalletDto | null> {
    return this.getWalletByCurrencyUseCase.execute(dto);
  }

  async getOpenableCurrencies (dto: UserWalletsDto): Promise<string[]> {
    return this.getOpenableCurrenciesUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async openWallet (dto: OpenWalletDto): Promise<WalletDto> {
    return this.openWalletUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async createWallet (dto: CreateWalletDto): Promise<WalletDto> {
    return this.createWalletUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async creditWallet (dto: WalletOperationDto): Promise<WalletOperationResultDto> {
    return this.creditWalletUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async debitWallet (dto: WalletOperationDto): Promise<WalletOperationResultDto> {
    return this.debitWalletUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async placeBet (dto: WalletOperationDto): Promise<WalletOperationResultDto> {
    return this.placeBetUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async settleWinnings (dto: WalletOperationDto): Promise<WalletOperationResultDto> {
    return this.settleWinningsUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async reserveFunds (dto: FundsOperationDto): Promise<WalletDto> {
    return this.reserveFundsUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async releaseFunds (dto: FundsOperationDto): Promise<WalletDto> {
    return this.releaseFundsUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async captureReservedFunds (dto: WalletOperationDto): Promise<WalletOperationResultDto> {
    return this.captureReservedFundsUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['wallet'], isPattern: true })
  async updateWalletStatus (dto: UpdateWalletStatusDto): Promise<WalletDto> {
    return this.updateWalletStatusUseCase.execute(dto);
  }
}

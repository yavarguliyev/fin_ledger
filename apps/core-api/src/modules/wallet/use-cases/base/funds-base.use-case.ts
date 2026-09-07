import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseAdapter, PostgresService } from '@common/libs';

import { WalletRepository } from '../../repositories/wallet.repository';
import { WalletDto, WalletInput } from '../../dtos/wallet/wallet.dto';
import { CalculateNewBalancesDto } from '../../dtos/balance/calculate-new-balances.dto';

@Injectable()
export abstract class FundsBaseUseCase<TInput, TOutput> {
  constructor (
    protected readonly postgresService: PostgresService,
    protected readonly walletRepository: WalletRepository
  ) {}

  protected abstract calculateNewBalances(wallet: WalletDto, amountMinor: number): CalculateNewBalancesDto;
  protected abstract execute(input: TInput): Promise<TOutput>;

  protected async processFunds ({ walletId, amountMinor, adapter }: WalletInput): Promise<WalletDto> {
    if (adapter) return this.executeInTx(walletId, amountMinor, adapter);
    return this.postgresService.getWriteConnection().transaction(adapter => this.executeInTx(walletId, amountMinor, adapter));
  }

  protected async executeInTx (walletId: string, amountMinor: number, adapter: DatabaseAdapter): Promise<WalletDto> {
    const wallet = await this.walletRepository.findByIdForUpdate(walletId, adapter);
    if (!wallet) throw new NotFoundException('Wallet not found');

    const expectedVersion = wallet.version!;
    const { newAvailable: availableBalanceMinor, newReserved: reservedBalanceMinor } = this.calculateNewBalances(wallet, amountMinor);

    const updated = await this.walletRepository.updateBalances({ walletId, availableBalanceMinor, reservedBalanceMinor, expectedVersion, adapter });
    if (!updated) throw new ConflictException('Concurrent modification of wallet balance');

    return updated;
  }
}

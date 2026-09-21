import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { PostgresService, WalletStatus } from '@common/libs';

import { WalletRepository } from '../../repositories/wallet.repository';
import { WalletDto } from '../../dtos/wallet/wallet.dto';
import { CalculateNewBalancesDto } from '../../dtos/balance/calculate-new-balances.dto';
import { FundsOperationDto } from '../../dtos/input/funds-operation.dto';
import { FundsTransactionDto } from '../../dtos/step/funds-transaction.dto';
import { CalculateBalancesInputDto } from '../../dtos/step/calculate-balances-input.dto';
import { WalletHelper } from '../../helpers/wallet.helper';

export abstract class FundsBaseUseCase {
  @Inject(PostgresService)
  protected readonly postgresService!: PostgresService;

  @Inject(WalletRepository)
  protected readonly walletRepository!: WalletRepository;

  protected readonly allowedStatuses?: WalletStatus[];

  protected abstract calculateNewBalances(dto: CalculateBalancesInputDto): CalculateNewBalancesDto;

  async execute (dto: FundsOperationDto): Promise<WalletDto> {
    const { adapter } = dto;
    if (adapter) return this.executeInTx({ ...dto, adapter });
    return this.postgresService.getWriteConnection().transaction({ callback: tx => this.executeInTx({ ...dto, adapter: tx }) });
  }

  protected async executeInTx (dto: FundsTransactionDto): Promise<WalletDto> {
    const { walletId, amountMinor, adapter } = dto;

    const wallet = await this.walletRepository.findByIdForUpdate({ id: walletId, adapter });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (this.allowedStatuses) WalletHelper.assertWalletStatus({ status: wallet.status, allowedStatuses: this.allowedStatuses });

    const expectedVersion = wallet.version!;
    const { newAvailable: availableBalanceMinor, newReserved: reservedBalanceMinor } = this.calculateNewBalances({ wallet, amountMinor });

    const updated = await this.walletRepository.updateBalances({ walletId, availableBalanceMinor, reservedBalanceMinor, expectedVersion, adapter });
    if (!updated) throw new ConflictException('Concurrent modification of wallet balance');

    return updated;
  }
}

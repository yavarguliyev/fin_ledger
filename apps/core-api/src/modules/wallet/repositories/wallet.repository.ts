import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseExtendedRepository, DatabaseAdapter, PostgresService, WalletStatus } from '@common/libs';

import { WalletDto } from '../dtos/wallet/wallet.dto';
import { CreateWalletDto } from '../dtos/wallet/wallet-create.dto';
import { UpdateWalletBalancesDto } from '../dtos/wallet/wallet-balances-update.dto';

@Injectable()
export class WalletRepository extends BaseExtendedRepository<WalletDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'wallets', {
      userId: 'user_id',
      ledgerAccountId: 'ledger_account_id',
      currency: 'currency',
      availableBalanceMinor: 'available_balance_minor',
      reservedBalanceMinor: 'reserved_balance_minor',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'userId',
      'ledgerAccountId',
      'currency',
      'availableBalanceMinor',
      'reservedBalanceMinor',
      'version',
      'status',
      'createdAt',
      'updatedAt'
    ];
  }

  async createWallet (input: CreateWalletDto): Promise<WalletDto | null> {
    const { availableBalanceMinor = 0, reservedBalanceMinor = 0, version = 0, status = WalletStatus.ACTIVE, adapter, ...rest } = input;

    return this.create(
      {
        ...rest,
        availableBalanceMinor,
        reservedBalanceMinor,
        version,
        status
      },
      undefined,
      adapter
    );
  }

  async findByUserId (userId: string): Promise<WalletDto | null> {
    return this.findOne({ user_id: userId });
  }

  async updateBalances (input: UpdateWalletBalancesDto): Promise<WalletDto | null> {
    const { walletId, availableBalanceMinor, reservedBalanceMinor, expectedVersion, adapter } = input;
    if (!walletId) throw new NotFoundException('Wallet ID is required');
    if (availableBalanceMinor === undefined || reservedBalanceMinor === undefined) throw new BadRequestException('Balance values are required');
    return this.updateWithVersion(walletId, { availableBalanceMinor, reservedBalanceMinor }, 'version', expectedVersion, adapter);
  }

  async closeWallet (walletId: string, adapter: DatabaseAdapter): Promise<WalletDto | null> {
    return this.update(walletId, { availableBalanceMinor: 0, reservedBalanceMinor: 0, status: WalletStatus.CLOSED }, undefined, adapter);
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, WalletStatus } from '@common/libs';

import { WalletDto } from '../dtos/wallet/wallet.dto';
import { CreateWalletDto } from '../dtos/input/create-wallet.dto';
import { UserWalletsDto } from '../dtos/input/user-wallets.dto';
import { WalletByCurrencyDto } from '../dtos/input/wallet-by-currency.dto';
import { UpdateWalletBalancesDto } from '../dtos/repository/update-wallet-balances.dto';

@Injectable()
export class WalletRepository extends BaseExtendedRepository<WalletDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'wallets',
      columnMappings: {
        userId: 'user_id',
        ledgerAccountId: 'ledger_account_id',
        currency: 'currency',
        availableBalanceMinor: 'available_balance_minor',
        reservedBalanceMinor: 'reserved_balance_minor',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
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

    return this.create({
      data: {
        ...rest,
        availableBalanceMinor,
        reservedBalanceMinor,
        version,
        status
      },
      adapter
    });
  }

  async findAllByUserId ({ userId }: UserWalletsDto): Promise<WalletDto[]> {
    return this.findAll({ where: { user_id: userId }, orderBy: 'created_at', orderDirection: 'ASC' });
  }

  async findByUserAndCurrency ({ userId, currency }: WalletByCurrencyDto): Promise<WalletDto | null> {
    return this.findOne({ where: { user_id: userId, currency } });
  }

  async updateBalances (input: UpdateWalletBalancesDto): Promise<WalletDto | null> {
    const { walletId, availableBalanceMinor, reservedBalanceMinor, expectedVersion, adapter } = input;
    if (!walletId) throw new NotFoundException('Wallet ID is required');
    if (availableBalanceMinor === undefined || reservedBalanceMinor === undefined) throw new BadRequestException('Balance values are required');
    return this.updateWithVersion({
      id: walletId,
      data: { availableBalanceMinor, reservedBalanceMinor },
      versionField: 'version',
      expectedVersion,
      adapter
    });
  }
}

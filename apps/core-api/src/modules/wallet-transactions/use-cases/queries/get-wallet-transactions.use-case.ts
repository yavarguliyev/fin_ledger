import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto, UserRoles } from '@common/libs';

import { WalletTransactionRepository } from '../../repositories/wallet-transaction.repository';
import { WalletTransactionRecordDto } from '../../dtos/transaction/wallet-transaction-record.dto';
import { WalletPaginatedReques } from '../../dtos/common/wallet-transaction-paginated-request.dto';
import { WalletTransactionsBaseUseCase } from '../base/wallet-transactions.base.use-case';

@Injectable()
export class GetWalletTransactionsUseCase extends WalletTransactionsBaseUseCase<
  WalletPaginatedReques,
  PaginatedResponseDto<WalletTransactionRecordDto>
> {
  constructor (protected override readonly walletTransactionRepository: WalletTransactionRepository) {
    super(walletTransactionRepository);
  }

  async execute ({ query, type, role }: WalletPaginatedReques): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    const { walletId, page, limit } = query;
    const offset = (page - 1) * limit;
    const isAdmin = role && [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR].includes(role);

    if (isAdmin) {
      const transactions = await this.walletTransactionRepository.findAllPaginated(limit, offset, type);
      const total = await this.walletTransactionRepository.countAll(type);
      return new PaginatedResponseDto(transactions, total, page, limit);
    }

    const transactions = await this.walletTransactionRepository.findByWalletIdPaginated(walletId, limit, offset, type);
    const total = await this.walletTransactionRepository.countByWalletId(walletId, type);
    return new PaginatedResponseDto(transactions, total, page, limit);
  }
}

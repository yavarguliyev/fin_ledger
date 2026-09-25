import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto, STAFF_ROLES } from '@common/libs';

import { WalletTransactionRecordDto } from '../../dtos/transaction/wallet-transaction-record.dto';
import { ListWalletTransactionsDto } from '../../dtos/input/list-wallet-transactions.dto';
import { WalletTransactionsBaseUseCase } from '../base/wallet-transactions.base.use-case';

@Injectable()
export class GetWalletTransactionsUseCase extends WalletTransactionsBaseUseCase<
  ListWalletTransactionsDto,
  PaginatedResponseDto<WalletTransactionRecordDto>
> {
  async execute (dto: ListWalletTransactionsDto): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    const { walletId, page, limit, type, role } = dto;

    const isStaff = role && STAFF_ROLES.includes(role);
    const criteria = { ...(!isStaff && { walletId }), ...(type && { type }), limit, offset: (page - 1) * limit };

    const [transactions, total] = await Promise.all([
      this.walletTransactionRepository.findPaginated(criteria),
      this.walletTransactionRepository.countTransactions(criteria)
    ]);

    return new PaginatedResponseDto({ data: transactions, total, page, pageSize: limit });
  }
}

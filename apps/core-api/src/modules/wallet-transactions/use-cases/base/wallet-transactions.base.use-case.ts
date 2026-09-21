import { Inject } from '@nestjs/common';

import { WalletTransactionRepository } from '../../repositories/wallet-transaction.repository';

export abstract class WalletTransactionsBaseUseCase<TInput, TOutput> {
  @Inject(WalletTransactionRepository)
  protected readonly walletTransactionRepository!: WalletTransactionRepository;

  abstract execute(input: TInput): Promise<TOutput>;
}

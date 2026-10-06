import { Inject } from '@nestjs/common';

import { WalletTransactionRepository } from '../../../wallet';

export abstract class WalletTransactionsBaseUseCase<TInput, TOutput> {
  @Inject(WalletTransactionRepository)
  protected readonly walletTransactionRepository!: WalletTransactionRepository;

  abstract execute(input: TInput): Promise<TOutput>;
}

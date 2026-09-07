import { Injectable } from '@nestjs/common';

import { WalletTransactionRepository } from '../../repositories/wallet-transaction.repository';

@Injectable()
export abstract class WalletTransactionsBaseUseCase<TInput, TOutput> {
  constructor (protected readonly walletTransactionRepository: WalletTransactionRepository) {}

  protected abstract execute(input: TInput): Promise<TOutput>;
}

import { Inject } from '@nestjs/common';

import { UserRepository } from '../../../user/repositories/user.repository';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export abstract class AdminBaseUseCase<TInput, TOutput> {
  @Inject(UserRepository)
  protected readonly userRepository!: UserRepository;

  @Inject(WalletTransactionRepository)
  protected readonly walletTransactionRepository!: WalletTransactionRepository;

  abstract execute(input: TInput): Promise<TOutput>;
}

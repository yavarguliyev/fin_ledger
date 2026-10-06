import { Inject } from '@nestjs/common';

import { UserRepository } from '../../../user';
import { WalletTransactionRepository } from '../../../wallet';

export abstract class AdminBaseUseCase<TInput, TOutput> {
  @Inject(UserRepository)
  protected readonly userRepository!: UserRepository;

  @Inject(WalletTransactionRepository)
  protected readonly walletTransactionRepository!: WalletTransactionRepository;

  abstract execute(input: TInput): Promise<TOutput>;
}

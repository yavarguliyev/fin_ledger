import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../user/repositories/user.repository';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

@Injectable()
export abstract class AdminBaseUseCase<TInput, TOutput> {
  constructor (
    protected readonly userRepository: UserRepository,
    protected readonly walletTransactionRepository: WalletTransactionRepository
  ) {}

  abstract execute(input: TInput): TOutput | Promise<TOutput>;
}

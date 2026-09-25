import { Inject, Injectable } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { ReleaseFundsUseCase } from './release-funds.use-case';
import { DebitWalletUseCase } from '../wallet/debit-wallet.use-case';
import { WalletOperationDto } from '../../../dtos/input/wallet-operation.dto';
import { WalletOperationResultDto } from '../../../dtos/transaction/wallet-operation-result.dto';
import { WalletOperationInTransactionDto } from '../../../dtos/input/wallet-operation-in-transaction.dto';

@Injectable()
export class CaptureReservedFundsUseCase {
  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    private readonly releaseFundsUseCase: ReleaseFundsUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase
  ) {}

  async execute (input: WalletOperationDto): Promise<WalletOperationResultDto> {
    if (input.adapter) return this.capture({ ...input, adapter: input.adapter });
    return this.postgresService.getWriteConnection().transaction({ callback: async adapter => this.capture({ ...input, adapter }) });
  }

  private async capture (input: WalletOperationInTransactionDto): Promise<WalletOperationResultDto> {
    const { walletId, amountMinor, adapter } = input;
    await this.releaseFundsUseCase.execute({ walletId, amountMinor, adapter });
    return this.debitWalletUseCase.execute(input);
  }
}

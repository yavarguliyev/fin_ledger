import { Inject, Injectable } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { ReleaseFundsUseCase } from './release-funds.use-case';
import { DebitWalletUseCase } from '../wallet/debit-wallet.use-case';
import { WalletOperationDto } from '../../../dtos/input/wallet-operation.dto';
import { WalletOperationResultDto } from '../../../dtos/transaction/wallet-operation-result.dto';

/**
 * Turns a reservation into a real debit. Release and debit share one transaction so
 * the funds are never spendable in between: otherwise a bet placed in that window
 * could make the debit fail after the provider had already paid the money out.
 */
@Injectable()
export class CaptureReservedFundsUseCase {
  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    private readonly releaseFundsUseCase: ReleaseFundsUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase
  ) {}

  async execute (input: WalletOperationDto): Promise<WalletOperationResultDto> {
    const { walletId, amountMinor } = input;

    return this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        await this.releaseFundsUseCase.execute({ walletId, amountMinor, adapter });

        return this.debitWalletUseCase.execute({ ...input, adapter });
      }
    });
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { WorkflowStep, WorkflowStepMeta, WorkflowSteps } from '@common/libs';

import { WalletService } from '../../../wallet/wallet.service';
import { DepositContextDto } from '../../dtos/payment/deposit-context.dto';

@Injectable()
@WorkflowStepMeta('CreditWallet')
export class CreditWalletStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'CreditWallet';

  constructor (private readonly walletService: WalletService) {}

  async execute (context: DepositContextDto): Promise<void> {
    if (!context.walletId) throw new BadRequestException('Wallet ID is required for CreditWallet step');
    if (!context.paymentId) throw new BadRequestException('Payment ID is required for CreditWallet step');

    const {
      dto: { amountMinor, currency },
      walletId,
      paymentId: transactionId
    } = context;

    await this.walletService.creditWallet({ amountMinor, currency, walletId, transactionId, reference: `deposit: ${transactionId}` });
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.walletId || !context.paymentId) return;

    const {
      dto: { amountMinor, currency },
      walletId,
      paymentId: transactionId
    } = context;

    await this.walletService.debitWallet({ amountMinor, currency, walletId, transactionId, reference: `reversal:deposit: ${transactionId}` });
  }
}

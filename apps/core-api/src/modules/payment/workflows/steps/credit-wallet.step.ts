import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStatus, WalletTransactionType, WorkflowStep, WorkflowStepMeta, WorkflowSteps } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { DepositContextDto } from '../../dtos/workflow/deposit-context.dto';

@Injectable()
@WorkflowStepMeta({ stepName: 'CreditWallet' })
export class CreditWalletStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'CreditWallet';

  constructor (
    private readonly walletService: WalletService,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async execute (context: DepositContextDto): Promise<void> {
    if (!context.walletId) throw new BadRequestException('Wallet ID is required for CreditWallet step');
    if (!context.paymentId) throw new BadRequestException('Payment ID is required for CreditWallet step');

    const {
      dto: { amountMinor, currency },
      walletId,
      paymentId: transactionId
    } = context;

    const { ledgerTransactionId } = await this.walletService.creditWallet({
      amountMinor,
      currency,
      walletId,
      transactionId,
      reference: `deposit: ${transactionId}`
    });

    const updated = await this.paymentRepository.updatePaymentStatus({
      paymentId: transactionId,
      status: PaymentStatus.COMPLETED,
      ledgerTransactionId
    });
    if (updated) context.payment = updated;
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.walletId || !context.paymentId) return;

    const {
      dto: { amountMinor, currency },
      walletId,
      paymentId: transactionId
    } = context;

    await this.walletService.debitWallet({
      amountMinor,
      currency,
      walletId,
      transactionId,
      reference: `reversal:deposit: ${transactionId}`,
      transactionType: WalletTransactionType.ADJUSTMENT
    });
    await this.paymentRepository.updatePaymentStatus({ paymentId: transactionId, status: PaymentStatus.COMPENSATED });
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStatus, WorkflowStep, WorkflowStepMeta, WorkflowSteps } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { DepositContextDto } from '../../dtos/payment/deposit-context.dto';

@Injectable()
@WorkflowStepMeta('CreditWallet')
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

    await this.walletService.creditWallet({ amountMinor, currency, walletId, transactionId, reference: `deposit: ${transactionId}` });

    const updated = await this.paymentRepository.updatePaymentStatus(transactionId, { status: PaymentStatus.COMPLETED });
    if (updated) context.payment = updated;
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.walletId || !context.paymentId) return;

    const {
      dto: { amountMinor, currency },
      walletId,
      paymentId: transactionId
    } = context;

    await this.walletService.debitWallet({ amountMinor, currency, walletId, transactionId, reference: `reversal:deposit: ${transactionId}` });
    await this.paymentRepository.updatePaymentStatus(transactionId, { status: PaymentStatus.COMPENSATED });
  }
}

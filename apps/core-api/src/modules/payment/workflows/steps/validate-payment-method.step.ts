import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentMethodStatus, WorkflowStep, WorkflowStepMeta, WorkflowSteps } from '@common/libs';

import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { DepositContextDto } from '../../dtos/workflow/deposit-context.dto';

@Injectable()
@WorkflowStepMeta({ stepName: 'ValidatePaymentMethod' })
export class ValidatePaymentMethodStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'ValidatePaymentMethod';

  constructor (
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly walletService: WalletService
  ) {}

  async execute (context: DepositContextDto): Promise<void> {
    const { paymentMethodId, currency } = context.dto;

    const userWallet = await this.walletService.getWalletByCurrency({ userId: context.userId, currency });
    if (!userWallet) throw new BadRequestException(`You don't have a ${currency} wallet`);

    context.walletId = userWallet.id;
    context.ledgerAccountId = userWallet.ledgerAccountId ?? '';

    if (!paymentMethodId) throw new BadRequestException('Payment method is required for deposit');

    const method = await this.paymentMethodRepository.findByIdAndUserId({ id: paymentMethodId, userId: context.userId });

    if (!method) throw new BadRequestException('Payment method not found or does not belong to user');
    if (method.status !== PaymentMethodStatus.VERIFIED) throw new BadRequestException('Payment method is not verified');
    if (!method.providerMethodId) throw new BadRequestException('Payment method token is missing');

    context.provider = method.provider;
    context.providerMethodId = method.providerMethodId;
  }

  async compensate (): Promise<void> {
    return Promise.resolve();
  }
}

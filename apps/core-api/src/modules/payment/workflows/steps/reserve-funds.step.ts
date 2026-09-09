import { Injectable, BadRequestException } from '@nestjs/common';
import { WorkflowStep, WorkflowStepMeta, WorkflowSteps } from '@common/libs';

import { WalletService } from '../../../wallet/wallet.service';
import { DepositContextDto } from '../../dtos/payment/deposit-context.dto';

@Injectable()
@WorkflowStepMeta('ReserveFunds')
export class ReserveFundsStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'ReserveFunds';

  constructor (private readonly walletService: WalletService) {}

  async execute (context: DepositContextDto): Promise<void> {
    if (!context.walletId) throw new BadRequestException('Wallet ID is required for ReserveFunds step');
    const wallet = await this.walletService.reserveFunds(context.walletId, context.dto.amountMinor);
    context.walletId = wallet.id;
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.walletId) return;
    await this.walletService.releaseFunds(context.walletId, context.dto.amountMinor);
  }
}

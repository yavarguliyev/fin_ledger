import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PaymentType } from '@common/libs';

import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { ValidateWalletDto } from '../../dtos/step/validate-wallet.dto';
import { PaymentActorDto } from '../../dtos/step/payment-actor.dto';
import { PasskeyStepUpService } from '../../../auth';

@Injectable()
export class RequestWithdrawalUseCase extends PaymentBaseUseCase {
  protected readonly paymentType = PaymentType.WITHDRAWAL;

  @Inject(PasskeyStepUpService)
  private readonly stepUp!: PasskeyStepUpService;

  protected validateWallet ({ wallet, dto }: ValidateWalletDto): void {
    if (Number(wallet.availableBalanceMinor) < dto.amountMinor) throw new BadRequestException('Insufficient funds for withdrawal');
  }

  protected override async assertPermitted ({ userId }: PaymentActorDto): Promise<void> {
    await this.stepUp.assertConfirmed({ userId });
  }
}

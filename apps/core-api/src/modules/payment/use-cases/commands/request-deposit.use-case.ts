import { Inject, Injectable } from '@nestjs/common';
import { PaymentType } from '@common/libs';

import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { PaymentActorDto } from '../../dtos/step/payment-actor.dto';
import { SelfExclusionHelper, AssertDepositAllowedUseCase } from '../../../user';

@Injectable()
export class RequestDepositUseCase extends PaymentBaseUseCase {
  protected readonly paymentType = PaymentType.DEPOSIT;

  @Inject(AssertDepositAllowedUseCase)
  private readonly assertDepositAllowed!: AssertDepositAllowedUseCase;

  protected validateWallet (): void {}

  protected override async assertPermitted ({ userId, currency, amountMinor }: PaymentActorDto): Promise<void> {
    const player = await this.authRepository.findById({ id: userId });
    SelfExclusionHelper.assertNotExcluded({ selfExclusionUntil: player?.selfExclusionUntil });
    await this.assertDepositAllowed.execute({ userId, currency, amountMinor });
  }
}

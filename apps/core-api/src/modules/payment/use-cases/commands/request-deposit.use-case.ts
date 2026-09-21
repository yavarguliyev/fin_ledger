import { Injectable } from '@nestjs/common';
import { PaymentType } from '@common/libs';

import { PaymentBaseUseCase } from '../base/payment-base.use-case';

@Injectable()
export class RequestDepositUseCase extends PaymentBaseUseCase {
  protected readonly paymentType = PaymentType.DEPOSIT;

  protected validateWallet (): void {}
}

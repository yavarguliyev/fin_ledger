import { Injectable } from '@nestjs/common';
import { PaymentType } from '@common/libs';

import { PaymentBaseUseCase } from '../base/payment-base.use-case';
import { RequestPayment } from '../../dtos/request/request-payment.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';

@Injectable()
export class RequestDepositUseCase extends PaymentBaseUseCase<RequestPayment, PaymentDto> {
  protected readonly paymentType = PaymentType.DEPOSIT;

  constructor () {
    super();
  }

  protected validateWallet (): void {}
}

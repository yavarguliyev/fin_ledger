import { Injectable } from '@nestjs/common';

import { RequestWithdrawalUseCase } from './use-cases/commands/request-withdrawal.use-case';
import { RequestDepositUseCase } from './use-cases/commands/request-deposit.use-case';
import { GetPaymentUseCase } from './use-cases/queries/get-payment.use-case';
import { ListUnresolvedPaymentsUseCase } from './use-cases/queries/list-unresolved-payments.use-case';
import { PaymentDto } from './dtos/payment/payment.dto';
import { PaymentResultDto } from './dtos/payment/payment-result.dto';
import { ProcessPaymentDto } from './dtos/input/process-payment.dto';
import { PaymentIdRequestDto } from './dtos/request/payment-id-request.dto';

@Injectable()
export class PaymentService {
  constructor (
    private readonly requestWithdrawalUseCase: RequestWithdrawalUseCase,
    private readonly requestDepositUseCase: RequestDepositUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listUnresolvedPaymentsUseCase: ListUnresolvedPaymentsUseCase
  ) {}

  async deposit (dto: ProcessPaymentDto): Promise<PaymentResultDto> {
    return this.requestDepositUseCase.execute(dto);
  }

  async withdraw (dto: ProcessPaymentDto): Promise<PaymentResultDto> {
    return this.requestWithdrawalUseCase.execute(dto);
  }

  async listUnresolved (): Promise<PaymentDto[]> {
    return this.listUnresolvedPaymentsUseCase.execute();
  }

  async getPayment (dto: PaymentIdRequestDto): Promise<PaymentDto> {
    return this.getPaymentUseCase.execute(dto);
  }
}

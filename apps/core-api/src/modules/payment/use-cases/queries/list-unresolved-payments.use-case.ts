import { Injectable } from '@nestjs/common';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentDto } from '../../dtos/payment/payment.dto';
import { PAYMENT_RECONCILIATION } from '../../constants/jobs/payment-reconciliation.constant';

@Injectable()
export class ListUnresolvedPaymentsUseCase {
  constructor (private readonly paymentRepository: PaymentRepository) {}

  async execute (): Promise<PaymentDto[]> {
    return this.paymentRepository.findUnresolved({ minAttempts: PAYMENT_RECONCILIATION.MAX_ATTEMPTS, limit: PAYMENT_RECONCILIATION.REVIEW_LIMIT });
  }
}

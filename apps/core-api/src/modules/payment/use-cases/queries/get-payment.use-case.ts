import { Injectable, NotFoundException } from '@nestjs/common';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentDto } from '../../dtos/payment/payment.dto';

@Injectable()
export class GetPaymentUseCase {
  constructor (private readonly paymentRepository: PaymentRepository) {}

  async execute (id: string): Promise<PaymentDto> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}

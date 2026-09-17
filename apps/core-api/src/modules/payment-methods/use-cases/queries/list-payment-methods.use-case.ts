import { Injectable } from '@nestjs/common';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { ListPaymentMethodsDto } from '../../dtos/request/list-payment-methods.dto';

@Injectable()
export class ListPaymentMethodsUseCase extends PaymentMethodBaseUseCase<ListPaymentMethodsDto, PaymentMethodDto[]> {
  constructor (private readonly paymentMethodRepository: PaymentMethodRepository) {
    super();
  }

  async execute ({ userId, status }: ListPaymentMethodsDto): Promise<PaymentMethodDto[]> {
    return this.paymentMethodRepository.findByUserId(userId, status);
  }
}

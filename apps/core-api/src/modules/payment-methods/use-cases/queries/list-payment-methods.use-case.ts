import { Injectable } from '@nestjs/common';

import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { ListPaymentMethodsDto } from '../../dtos/input/list-payment-methods.dto';

@Injectable()
export class ListPaymentMethodsUseCase extends PaymentMethodBaseUseCase<ListPaymentMethodsDto, PaymentMethodDto[]> {
  async execute (dto: ListPaymentMethodsDto): Promise<PaymentMethodDto[]> {
    return this.paymentMethodRepository.findByUser(dto);
  }
}

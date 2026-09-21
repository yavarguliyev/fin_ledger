import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { PaymentProviderRegistry } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { ValidateOwnershipDto } from '../../dtos/helper/validate-ownership.dto';

export abstract class PaymentMethodBaseUseCase<TInput, TOutput> {
  @Inject(PaymentMethodRepository)
  protected readonly paymentMethodRepository!: PaymentMethodRepository;

  @Inject(PaymentProviderRegistry)
  protected readonly providerRegistry!: PaymentProviderRegistry;

  abstract execute(input: TInput): Promise<TOutput>;

  protected validateOwnership ({ method, userId }: ValidateOwnershipDto): PaymentMethodDto {
    if (!method) throw new NotFoundException('Payment method not found');
    if (method.userId !== userId) throw new ForbiddenException('You do not have permission to access this payment method');
    return method;
  }
}

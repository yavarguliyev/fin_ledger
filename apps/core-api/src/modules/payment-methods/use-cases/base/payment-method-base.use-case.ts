import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';

@Injectable()
export abstract class PaymentMethodBaseUseCase<TInput, TOutput> {
  constructor (
    protected readonly postgresService: PostgresService,
    protected readonly paymentMethodRepository: PaymentMethodRepository
  ) {}

  protected abstract execute(input: TInput): Promise<TOutput>;

  protected maskAccountNumber (accountNumber: string): string {
    const cleaned = accountNumber.replace(/\s+/g, '');
    const lastFour = cleaned.slice(-4);
    return `****${lastFour}`;
  }

  protected validateOwnership (method: PaymentMethodDto | null, userId: string): PaymentMethodDto {
    if (!method) throw new NotFoundException('Payment method not found');
    if (method.userId !== userId) throw new ForbiddenException('You do not have permission to access this payment method');
    return method;
  }
}

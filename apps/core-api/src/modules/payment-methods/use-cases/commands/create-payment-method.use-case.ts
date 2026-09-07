import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentMethodStatus, PostgresService } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { CreatePaymentMethod } from '../../dtos/request/create-payment-method.dto';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';

@Injectable()
export class CreatePaymentMethodUseCase extends PaymentMethodBaseUseCase<CreatePaymentMethod, PaymentMethodDto> {
  constructor (
    protected override readonly postgresService: PostgresService,
    protected override readonly paymentMethodRepository: PaymentMethodRepository
  ) {
    super(postgresService, paymentMethodRepository);
  }

  async execute (dto: CreatePaymentMethod): Promise<PaymentMethodDto> {
    const maskedAccount = this.maskAccountNumber(dto.accountNumber);

    const created = await this.paymentMethodRepository.createPaymentMethod({
      userId: dto.userId,
      type: dto.type,
      accountHolder: dto.accountHolder,
      maskedAccount,
      bankName: dto.bankName ?? null,
      status: PaymentMethodStatus.PENDING_VERIFICATION,
      isDefault: dto.isDefault ?? false,
      metadata: {
        rawLength: dto.accountNumber.length
      }
    });

    if (!created) throw new InternalServerErrorException('Failed to create payment method');

    return created;
  }
}

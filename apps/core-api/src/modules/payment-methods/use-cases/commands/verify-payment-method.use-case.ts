import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentMethodStatus, PostgresService } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { VerifyPaymentMethodDto } from '../../dtos/request/verify-payment-method.dto';

@Injectable()
export class VerifyPaymentMethodUseCase extends PaymentMethodBaseUseCase<VerifyPaymentMethodDto, PaymentMethodDto> {
  constructor (
    protected override readonly postgresService: PostgresService,
    protected override readonly paymentMethodRepository: PaymentMethodRepository
  ) {
    super(postgresService, paymentMethodRepository);
  }

  async execute ({ id, userId }: VerifyPaymentMethodDto): Promise<PaymentMethodDto> {
    const existing = await this.paymentMethodRepository.findById(id);
    const method = this.validateOwnership(existing, userId);

    if (method.status === PaymentMethodStatus.VERIFIED) {
      return method;
    }

    if (method.status === PaymentMethodStatus.REMOVED || method.status === PaymentMethodStatus.REJECTED) {
      throw new BadRequestException(`Cannot verify payment method in ${method.status} status`);
    }

    const updated = await this.paymentMethodRepository.updateStatus(id, PaymentMethodStatus.VERIFIED);
    if (!updated) throw new InternalServerErrorException('Failed to verify payment method');

    return updated;
  }
}

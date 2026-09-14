import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CardBrand, detectCardBrand, PaymentMethodType, PaymentProvider, PaymentProviderRegistry, PostgresService } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { buildProviderMethodDetails } from '../../helpers/build-payment-method-details.helper';
import { buildPaymentMethodEntity } from '../../helpers/build-payment-method-entity.helper';
import { CreatePaymentMethod } from '../../dtos/request/create-payment-method.dto';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';

@Injectable()
export class CreatePaymentMethodUseCase extends PaymentMethodBaseUseCase<CreatePaymentMethod, PaymentMethodDto> {
  constructor (
    protected override readonly postgresService: PostgresService,
    protected override readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly providerRegistry: PaymentProviderRegistry
  ) {
    super(postgresService, paymentMethodRepository);
  }

  async execute (dto: CreatePaymentMethod): Promise<PaymentMethodDto> {
    const maskedAccount = this.maskAccountNumber(dto.accountNumber);
    const providerName = dto.provider ?? PaymentProvider.LOCAL;
    const provider = this.providerRegistry.get(providerName);

    let detectedBrand: CardBrand = CardBrand.UNKNOWN;
    if (dto.type === PaymentMethodType.CREDIT_CARD || dto.type === PaymentMethodType.DEBIT_CARD) {
      detectedBrand = detectCardBrand(dto.accountNumber);
    }

    const providerDetails = buildProviderMethodDetails(dto);
    const providerResult = await provider.createPaymentMethod(providerDetails);

    const entity = buildPaymentMethodEntity(dto, providerResult, maskedAccount, detectedBrand, providerName);
    const created = await this.paymentMethodRepository.createPaymentMethod(entity);

    if (!created) throw new InternalServerErrorException('Failed to create payment method');

    return created;
  }
}

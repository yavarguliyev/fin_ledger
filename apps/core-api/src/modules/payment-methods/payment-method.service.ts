import { Injectable } from '@nestjs/common';
import { SetupSessionResultDto } from '@common/libs';

import { RemovePaymentMethodUseCase } from './use-cases/commands/remove-payment-method.use-case';
import { VerifyPaymentMethodUseCase } from './use-cases/commands/verify-payment-method.use-case';
import { CreateSetupSessionUseCase } from './use-cases/commands/create-setup-session.use-case';
import { ConfirmSetupSessionUseCase } from './use-cases/commands/confirm-setup-session.use-case';
import { ListPaymentMethodsUseCase } from './use-cases/queries/list-payment-methods.use-case';
import { GetPaymentMethodUseCase } from './use-cases/queries/get-payment-method.use-case';
import { PaymentMethodDto } from './dtos/payment-method/payment-method.dto';
import { CreateSetupSessionDto } from './dtos/input/create-setup-session.dto';
import { ConfirmSetupSessionDto } from './dtos/input/confirm-setup-session.dto';
import { ListPaymentMethodsDto } from './dtos/input/list-payment-methods.dto';
import { PaymentMethodByUserDto } from './dtos/input/payment-method-by-user.dto';

@Injectable()
export class PaymentMethodService {
  constructor (
    private readonly removePaymentMethodUseCase: RemovePaymentMethodUseCase,
    private readonly verifyPaymentMethodUseCase: VerifyPaymentMethodUseCase,
    private readonly listPaymentMethodsUseCase: ListPaymentMethodsUseCase,
    private readonly getPaymentMethodUseCase: GetPaymentMethodUseCase,
    private readonly createSetupSessionUseCase: CreateSetupSessionUseCase,
    private readonly confirmSetupSessionUseCase: ConfirmSetupSessionUseCase
  ) {}

  async removePaymentMethod (dto: PaymentMethodByUserDto): Promise<PaymentMethodDto> {
    return this.removePaymentMethodUseCase.execute(dto);
  }

  async verifyPaymentMethod (dto: PaymentMethodByUserDto): Promise<PaymentMethodDto> {
    return this.verifyPaymentMethodUseCase.execute(dto);
  }

  async listPaymentMethods (dto: ListPaymentMethodsDto): Promise<PaymentMethodDto[]> {
    return this.listPaymentMethodsUseCase.execute(dto);
  }

  async getPaymentMethod (dto: PaymentMethodByUserDto): Promise<PaymentMethodDto> {
    return this.getPaymentMethodUseCase.execute(dto);
  }

  async createSetupSession (dto: CreateSetupSessionDto): Promise<SetupSessionResultDto> {
    return this.createSetupSessionUseCase.execute(dto);
  }

  async confirmSetupSession (dto: ConfirmSetupSessionDto): Promise<PaymentMethodDto> {
    return this.confirmSetupSessionUseCase.execute(dto);
  }
}

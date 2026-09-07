import { Module } from '@nestjs/common';

import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodRepository } from './repositories/payment-method.repository';
import { CreatePaymentMethodUseCase } from './use-cases/commands/create-payment-method.use-case';
import { RemovePaymentMethodUseCase } from './use-cases/commands/remove-payment-method.use-case';
import { VerifyPaymentMethodUseCase } from './use-cases/commands/verify-payment-method.use-case';
import { ListPaymentMethodsUseCase } from './use-cases/queries/list-payment-methods.use-case';
import { GetPaymentMethodUseCase } from './use-cases/queries/get-payment-method.use-case';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [PaymentMethodController],
  providers: [
    PaymentMethodService,
    PaymentMethodRepository,
    CreatePaymentMethodUseCase,
    RemovePaymentMethodUseCase,
    VerifyPaymentMethodUseCase,
    ListPaymentMethodsUseCase,
    GetPaymentMethodUseCase
  ],
  exports: [PaymentMethodService, PaymentMethodRepository, GetPaymentMethodUseCase]
})
export class PaymentMethodModule {}

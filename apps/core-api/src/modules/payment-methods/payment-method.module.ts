import { Module } from '@nestjs/common';

import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodRepository } from './repositories/payment-method.repository';
import { RemovePaymentMethodUseCase } from './use-cases/commands/remove-payment-method.use-case';
import { VerifyPaymentMethodUseCase } from './use-cases/commands/verify-payment-method.use-case';
import { CreateSetupSessionUseCase } from './use-cases/commands/create-setup-session.use-case';
import { ConfirmSetupSessionUseCase } from './use-cases/commands/confirm-setup-session.use-case';
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
    RemovePaymentMethodUseCase,
    VerifyPaymentMethodUseCase,
    CreateSetupSessionUseCase,
    ConfirmSetupSessionUseCase,
    ListPaymentMethodsUseCase,
    GetPaymentMethodUseCase
  ],
  exports: [PaymentMethodService, PaymentMethodRepository, GetPaymentMethodUseCase]
})
export class PaymentMethodModule {}

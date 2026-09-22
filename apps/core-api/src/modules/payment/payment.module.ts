import { Module } from '@nestjs/common';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { RequestDepositUseCase } from './use-cases/commands/request-deposit.use-case';
import { RequestWithdrawalUseCase } from './use-cases/commands/request-withdrawal.use-case';
import { GetPaymentUseCase } from './use-cases/queries/get-payment.use-case';
import { CompletePaymentUseCase } from './use-cases/commands/complete-payment.use-case';
import { FailPaymentUseCase } from './use-cases/commands/fail-payment.use-case';
import { PaymentReconciliationJob } from './jobs/payment-reconciliation.job';
import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentMethodModule } from '../payment-methods/payment-method.module';

@Module({
  imports: [SharedModule, WalletModule, AuthModule, PaymentMethodModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    RequestDepositUseCase,
    RequestWithdrawalUseCase,
    CompletePaymentUseCase,
    FailPaymentUseCase,
    PaymentReconciliationJob,
    GetPaymentUseCase
  ],
  exports: [PaymentService, PaymentRepository, CompletePaymentUseCase, FailPaymentUseCase]
})
export class PaymentModule {}

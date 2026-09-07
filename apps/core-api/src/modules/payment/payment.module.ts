import { Module } from '@nestjs/common';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { RequestDepositUseCase } from './use-cases/commands/request-deposit.use-case';
import { RequestWithdrawalUseCase } from './use-cases/commands/request-withdrawal.use-case';
import { GetPaymentUseCase } from './use-cases/queries/get-payment.use-case';
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
    GetPaymentUseCase
  ],
  exports: [PaymentService]
})
export class PaymentModule {}

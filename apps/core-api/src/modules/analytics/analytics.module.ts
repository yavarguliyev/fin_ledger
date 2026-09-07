import { Module } from '@nestjs/common';

import { PaymentCompletedHandler } from './use-cases/commands/analytics-payment-completed-handler.use-case';
import { PaymentFailedHandler } from './use-cases/commands/analytics-payment-failed-handler.use-case';
import { WalletCreditedHandler } from './use-cases/commands/analytics-wallet-credited-handler.use-case';
import { WalletDebitedHandler } from './use-cases/commands/analytics-wallet-debited-handler.use-case';

@Module({
  providers: [PaymentCompletedHandler, PaymentFailedHandler, WalletCreditedHandler, WalletDebitedHandler]
})
export class AnalyticsModule {}

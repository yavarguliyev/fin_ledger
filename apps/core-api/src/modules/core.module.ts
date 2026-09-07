import { Module } from '@nestjs/common';

import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { GameEventsModule } from './game-events/game-events.module';
import { LedgerModule } from './ledger/ledger.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentMethodModule } from './payment-methods/payment-method.module';
import { WalletModule } from './wallet/wallet.module';
import { UserModule } from './user/user.module';
import { MetricsModule } from './metrics/metrics.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AdminModule,
    AnalyticsModule,
    EmailModule,
    MetricsModule,
    AuthModule,
    GameEventsModule,
    LedgerModule,
    NotificationModule,
    PaymentModule,
    PaymentMethodModule,
    WalletModule,
    UserModule
  ]
})
export class CoreModule {}

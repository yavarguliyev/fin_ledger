import { Module } from '@nestjs/common';
import { KafkaModule, ClientIds } from '@common/libs';

import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { BetModule } from './bet/bet.module';
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
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    KafkaModule.forRoot({ clientId: ClientIds.API_GATEWAY }),
    AdminModule,
    AnalyticsModule,
    AuditModule,
    EmailModule,
    MetricsModule,
    AuthModule,
    BetModule,
    GameEventsModule,
    LedgerModule,
    NotificationModule,
    PaymentModule,
    PaymentMethodModule,
    WalletModule,
    UserModule,
    WebhookModule
  ]
})
export class CoreModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { KafkaModule, ClientIds, RateLimitHelper, REDIS_CACHE_PROVIDER, RedisCacheProvider, RedisThrottlerStorage } from '@common/libs';

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
import { HealthModule } from './health/health.module';
import { RetentionModule } from './retention/retention.module';
import { AdminModule } from './admin/admin.module';
import { WebhookModule } from './webhook/webhook.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    KafkaModule.forRoot({ clientId: ClientIds.API_GATEWAY }),
    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      inject: [REDIS_CACHE_PROVIDER],
      useFactory: (redis: RedisCacheProvider) => RateLimitHelper.options({ storage: new RedisThrottlerStorage({ redis }) })
    }),
    AdminModule,
    AnalyticsModule,
    AuditModule,
    EmailModule,
    MetricsModule,
    HealthModule,
    RetentionModule,
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
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class CoreModule {}

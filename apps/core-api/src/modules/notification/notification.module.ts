import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationStreamProvider } from './providers/notification-stream.provider';
import { CreateNotificationUseCase } from './use-cases/commands/create-notification.use-case';
import { GetNotificationsUseCase } from './use-cases/queries/get-notifications.use-case';
import { MarkNotificationReadUseCase } from './use-cases/commands/mark-notification-read.use-case';
import { IssueStreamTicketUseCase } from './use-cases/commands/issue-stream-ticket.use-case';
import { StreamNotificationsUseCase } from './use-cases/queries/stream-notifications.use-case';
import { SharedModule } from '../../shared/shared.module';
import { BetSettledConsumer } from './consumers/events/bet-settled.consumer';
import { PaymentCompletedConsumer } from './consumers/events/payment-completed.consumer';
import { PaymentFailedConsumer } from './consumers/events/payment-failed.consumer';
import { UserRegisteredConsumer } from './consumers/events/user-registered.consumer';
import { WalletCreditedConsumer } from './consumers/events/wallet-credited.consumer';
import { WalletDebitedConsumer } from './consumers/events/wallet-debited.consumer';

@Module({
  imports: [SharedModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationStreamProvider,
    CreateNotificationUseCase,
    GetNotificationsUseCase,
    MarkNotificationReadUseCase,
    IssueStreamTicketUseCase,
    StreamNotificationsUseCase,
    BetSettledConsumer,
    PaymentCompletedConsumer,
    PaymentFailedConsumer,
    UserRegisteredConsumer,
    WalletCreditedConsumer,
    WalletDebitedConsumer
  ],
  exports: [NotificationService]
})
export class NotificationModule {}

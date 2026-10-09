import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { PaymentMethodModule } from '../payment-methods/payment-method.module';
import { PaymentModule } from '../payment/payment.module';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { HandlePaymentMethodEventUseCase } from './use-cases/commands/handle-payment-method-event.use-case';
import { HandlePaymentChargeEventUseCase } from './use-cases/commands/handle-payment-charge-event.use-case';
import { WebhookReplayJob } from './jobs/webhook-replay.job';
import { WebhookQueueConsumer } from './consumers/webhook-queue.consumer';
import { ApplyWebhookEventUseCase } from './use-cases/commands/apply-webhook-event.use-case';
import { ProcessWebhookUseCase } from './use-cases/commands/process-webhook.use-case';
import { ReplayWebhookEventUseCase } from './use-cases/commands/replay-webhook-event.use-case';

@Module({
  imports: [SharedModule, PaymentMethodModule, PaymentModule],
  controllers: [WebhookController],
  providers: [
    WebhookEventRepository,
    HandlePaymentMethodEventUseCase,
    HandlePaymentChargeEventUseCase,
    ApplyWebhookEventUseCase,
    ProcessWebhookUseCase,
    ReplayWebhookEventUseCase,
    WebhookService,
    WebhookReplayJob,
    WebhookQueueConsumer
  ],
  exports: [WebhookService, WebhookEventRepository]
})
export class WebhookModule {}

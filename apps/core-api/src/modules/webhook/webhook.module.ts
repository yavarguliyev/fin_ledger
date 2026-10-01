import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { PaymentMethodModule } from '../payment-methods/payment-method.module';
import { PaymentModule } from '../payment/payment.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { HandlePaymentMethodEventUseCase } from './use-cases/commands/handle-payment-method-event.use-case';
import { HandlePaymentChargeEventUseCase } from './use-cases/commands/handle-payment-charge-event.use-case';
import { WebhookReplayJob } from './jobs/webhook-replay.job';

@Module({
  imports: [SharedModule, PaymentMethodModule, PaymentModule],
  controllers: [WebhookController],
  providers: [WebhookEventRepository, HandlePaymentMethodEventUseCase, HandlePaymentChargeEventUseCase, WebhookService, WebhookReplayJob],
  exports: [WebhookService, WebhookEventRepository]
})
export class WebhookModule {}

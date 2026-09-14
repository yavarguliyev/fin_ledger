import { Injectable } from '@nestjs/common';
import { OutboxRepository, PaymentProviderRegistry, PostgresService } from '@common/libs';

import { WebhookEventRepository } from '../../repositories/webhook-event.repository';
import { PaymentRepository } from '../../../payment/repositories/payment.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

@Injectable()
export abstract class WebhookBaseUseCase<TInput, TOutput> {
  constructor (
    protected readonly paymentRepository: PaymentRepository,
    protected readonly outboxRepository: OutboxRepository,
    protected readonly postgresService: PostgresService,
    protected readonly webhookEventRepository: WebhookEventRepository,
    protected readonly providerRegistry: PaymentProviderRegistry,
    protected readonly paymentMethodRepository: PaymentMethodRepository
  ) {}

  abstract execute(input: TInput): Promise<TOutput>;
}

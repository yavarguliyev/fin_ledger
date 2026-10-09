import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackgroundTask, BackgroundWorker, ProcessRole, RawQueueMessageDto, RequestScope, SqsQueueConsumerService } from '@common/libs';

import { WebhookService } from '../services/webhook.service';
import { WEBHOOK_QUEUE } from '../constants/queue/webhook-queue.constant';
import { WEBHOOK_ERRORS } from '../constants/errors/webhook-errors.constant';

@Injectable()
@BackgroundWorker({ role: ProcessRole.WORKER })
export class WebhookQueueConsumer implements BackgroundTask {
  private consumer: SqsQueueConsumerService | null = null;

  constructor (
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService
  ) {}

  async start (): Promise<void> {
    const queueName = this.configService.get<string>(WEBHOOK_QUEUE.QUEUE_KEY);
    if (!queueName) return;

    this.consumer = new SqsQueueConsumerService({ configService: this.configService });
    await this.consumer.start({ queueName, handler: message => this.handle(message) });
  }

  async stop (): Promise<void> {
    await this.consumer?.stop();
    this.consumer = null;
  }

  private handle ({ body, attributes }: RawQueueMessageDto): Promise<void> {
    const { [WEBHOOK_QUEUE.PROVIDER_ATTRIBUTE]: provider, ...headers } = attributes;
    if (!provider) throw new BadRequestException(WEBHOOK_ERRORS.MISSING_PROVIDER);

    return RequestScope.runSystem(async () => {
      await this.webhookService.processWebhook({ provider, rawPayload: body, headers });
    });
  }
}

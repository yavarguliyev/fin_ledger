import { setTimeout as sleep } from 'node:timers/promises';
import { Logger } from '@nestjs/common';
import { GetQueueUrlCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { BaseHelper, ClientIds, ServiceClientDto } from '@common/shared-libs';
import { DrainHelper } from '@common/messaging';

import { SQS_CONSTANTS as C } from '../constants/sqs/sqs.constant';
import { QueueHandleDto } from '../dtos/step/queue-handle.dto';
import { QueuePollDto } from '../dtos/step/queue-poll.dto';
import { QueueSubscriptionDto } from '../dtos/step/queue-subscription.dto';
import { SqsAttributesHelper } from '../helpers/sqs-attributes.helper';
import { SqsConfigHelper } from '../helpers/sqs-config.helper';
import { SqsSettleHelper } from '../helpers/sqs-settle.helper';

export class SqsQueueConsumerService {
  private readonly logger: Logger;
  private readonly client: SQSClient;
  private controller: AbortController | null = null;
  private inFlight = 0;

  constructor ({ configService, clientId }: ServiceClientDto) {
    this.logger = new Logger(`${SqsQueueConsumerService.name}:${clientId || ClientIds.DEFAULT}`);
    this.client = new SQSClient(SqsConfigHelper.clientConfig(SqsConfigHelper.connection({ configService })));
  }

  async start (subscription: QueueSubscriptionDto): Promise<void> {
    const { QueueUrl } = await this.client.send(new GetQueueUrlCommand({ QueueName: subscription.queueName }));
    this.controller = new AbortController();

    void this.poll({ subscription, queueUrl: QueueUrl!, signal: this.controller.signal });
    this.logger.log(`Consuming ${subscription.queueName}`);
  }

  async stop (): Promise<void> {
    this.controller?.abort();
    this.controller = null;
    await DrainHelper.drain({ pending: () => this.inFlight, logger: this.logger });
    this.client.destroy();
  }

  private async poll ({ subscription, queueUrl, signal }: QueuePollDto): Promise<void> {
    while (!signal.aborted) {
      try {
        const { Messages = [] } = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: C.MAX_MESSAGES,
            WaitTimeSeconds: C.WAIT_SECONDS,
            MessageAttributeNames: [C.ALL_ATTRIBUTES],
            MessageSystemAttributeNames: [C.RECEIVE_COUNT_ATTRIBUTE]
          }),
          { abortSignal: signal }
        );

        await Promise.all(Messages.map(message => this.handle({ subscription, queueUrl, message })));
      } catch (error) {
        if (signal.aborted) return;
        this.logger.error(`Polling ${subscription.queueName} failed: ${BaseHelper.errorResponse({ error }).message}`);
        await sleep(C.ERROR_BACKOFF_MS);
      }
    }
  }

  private async handle ({ subscription: { queueName, handler }, queueUrl, message }: QueueHandleDto): Promise<void> {
    const settle = { client: this.client, queueUrl, queue: queueName, message, logger: this.logger };
    this.inFlight += 1;

    try {
      await handler({ body: message.Body!, attributes: SqsAttributesHelper.toRecord({ attributes: message.MessageAttributes }) });
      await SqsSettleHelper.acknowledge(settle);
    } catch (error) {
      await SqsSettleHelper.retry({ ...settle, lastError: BaseHelper.errorResponse({ error }).message });
    } finally {
      this.inFlight -= 1;
    }
  }
}

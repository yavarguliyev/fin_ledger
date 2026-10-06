import { setTimeout as sleep } from 'node:timers/promises';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { GetQueueAttributesCommand, GetQueueUrlCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { BaseHelper, ServiceClientDto, UnknownRecord } from '@common/shared-libs';
import { BaseMessageBroker, BrokerPublishDto, BrokerSubscribeDto, QueueNameDto, ReplayDeadLettersDto } from '@common/messaging';

import { SQS_CONSTANTS as C } from '../constants/sqs/sqs.constant';
import { SqsSettingsDto } from '../dtos/config/sqs-settings.dto';
import { SqsHandleDto } from '../dtos/step/sqs-handle.dto';
import { SqsPollDto } from '../dtos/step/sqs-poll.dto';
import { SqsAttributesHelper } from '../helpers/sqs-attributes.helper';
import { SqsConfigHelper } from '../helpers/sqs-config.helper';
import { SqsNamingHelper } from '../helpers/sqs-naming.helper';
import { SqsReplayHelper } from '../helpers/sqs-replay.helper';
import { SqsSettleHelper } from '../helpers/sqs-settle.helper';

@Injectable()
export class SqsBrokerService extends BaseMessageBroker implements OnModuleDestroy {
  private readonly settings: SqsSettingsDto;
  private readonly sqs: SQSClient;
  private readonly sns: SNSClient;
  private readonly pollers = new Map<string, AbortController>();
  private readonly queueUrls = new Map<string, string>();

  constructor ({ configService, clientId }: ServiceClientDto) {
    super({ configService, ...(clientId && { clientId }) });
    this.settings = SqsConfigHelper.settings({ configService });
    this.sqs = new SQSClient(SqsConfigHelper.clientConfig(this.settings));
    this.sns = new SNSClient(SqsConfigHelper.clientConfig(this.settings));
  }

  async onModuleDestroy (): Promise<void> {
    this.stopped = true;
    this.pollers.forEach(controller => controller.abort());
    this.pollers.clear();
    await this.drain();
    this.sqs.destroy();
    this.sns.destroy();
  }

  async publish (message: BrokerPublishDto): Promise<void> {
    await this.sns.send(
      new PublishCommand({
        TopicArn: this.settings.topicArn,
        Message: JSON.stringify(message.payload),
        MessageAttributes: SqsAttributesHelper.fromPublish(message)
      })
    );
  }

  async queueDepth ({ queue }: QueueNameDto): Promise<number> {
    const { Attributes } = await this.sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: await this.queueUrl({ queue: this.physical({ queue }) }), AttributeNames: [C.DEPTH_ATTRIBUTE] })
    );

    return Number(Attributes?.[C.DEPTH_ATTRIBUTE] ?? C.EMPTY_DEPTH);
  }

  async replayDeadLetters ({ queue, limit }: ReplayDeadLettersDto): Promise<number> {
    const target = this.physical({ queue });

    return SqsReplayHelper.replay({
      client: this.sqs,
      sourceUrl: await this.queueUrl({ queue: SqsNamingHelper.deadLetterQueue({ queue: target }) }),
      targetUrl: await this.queueUrl({ queue: target }),
      limit: limit ?? C.REPLAY_DEFAULT_LIMIT,
      logger: this.logger
    });
  }

  protected async consume (subscription: BrokerSubscribeDto): Promise<void> {
    const queueUrl = await this.queueUrl({ queue: this.physical({ queue: subscription.queue }) });
    const controller = new AbortController();

    this.pollers.set(subscription.queue, controller);
    void this.poll({ subscription, queueUrl, signal: controller.signal });
  }

  protected cancel ({ queue }: QueueNameDto): Promise<void> {
    this.pollers.get(queue)?.abort();
    this.pollers.delete(queue);
    return Promise.resolve();
  }

  private async poll ({ subscription, queueUrl, signal }: SqsPollDto): Promise<void> {
    while (!signal.aborted && !this.stopped) {
      try {
        const { Messages = [] } = await this.sqs.send(
          new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: C.MAX_MESSAGES,
            WaitTimeSeconds: C.WAIT_SECONDS,
            MessageAttributeNames: [C.ALL_ATTRIBUTES],
            MessageSystemAttributeNames: [C.RECEIVE_COUNT_ATTRIBUTE]
          }),
          { abortSignal: signal }
        );

        await Promise.all(Messages.map(message => this.track(this.handle({ subscription, queueUrl, message }))));
      } catch (error) {
        if (signal.aborted || this.stopped) return;
        this.logger.error(`Polling ${subscription.queue} failed: ${BaseHelper.errorResponse({ error }).message}`);
        await sleep(C.ERROR_BACKOFF_MS);
      }
    }
  }

  private async handle ({ subscription: { queue, handler, inbox }, queueUrl, message }: SqsHandleDto): Promise<void> {
    const settle = { client: this.sqs, queueUrl, queue, message, logger: this.logger };

    try {
      const payload = JSON.parse(message.Body!) as UnknownRecord;
      const eventId = SqsAttributesHelper.eventId({ attributes: message.MessageAttributes });

      await this.deliver({ queue, payload, handler, ...(eventId && { eventId }), ...(inbox && { inbox }) });
      await SqsSettleHelper.acknowledge(settle);
    } catch (error) {
      await SqsSettleHelper.retry({ ...settle, lastError: BaseHelper.errorResponse({ error }).message });
    }
  }

  private physical ({ queue }: QueueNameDto): string {
    return SqsNamingHelper.queueName({ prefix: this.settings.queuePrefix, queue });
  }

  private async queueUrl ({ queue }: QueueNameDto): Promise<string> {
    const cached = this.queueUrls.get(queue);
    if (cached) return cached;

    const { QueueUrl } = await this.sqs.send(new GetQueueUrlCommand({ QueueName: queue }));
    this.queueUrls.set(queue, QueueUrl!);

    return QueueUrl!;
  }
}

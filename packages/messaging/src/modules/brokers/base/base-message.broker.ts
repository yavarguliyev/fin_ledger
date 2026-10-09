import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, ClientIds, RequestScope, ServiceClientDto } from '@common/shared-libs';

import { BrokerDeliveryDto } from '../../dtos/broker/broker-delivery.dto';
import { BrokerPublishDto } from '../../dtos/broker/broker-publish.dto';
import { BrokerSubscribeDto } from '../../dtos/broker/broker-subscribe.dto';
import { InboxReleaseDto } from '../../dtos/broker/inbox-release.dto';
import { QueueNameDto } from '../../dtos/broker/queue-name.dto';
import { ReplayDeadLettersDto } from '../../dtos/broker/replay-dead-letters.dto';
import { DrainHelper } from '../../helpers/drain.helper';
import { MessageBroker } from '../../interfaces/message-broker.interface';

export abstract class BaseMessageBroker implements MessageBroker {
  protected readonly logger: Logger;
  protected readonly clientId: ClientIds;
  protected readonly configService: ConfigService;
  protected readonly subscriptions: BrokerSubscribeDto[] = [];
  protected inFlight = 0;
  protected stopped = false;

  protected constructor ({ configService, clientId }: ServiceClientDto) {
    this.configService = configService;
    this.clientId = clientId || ClientIds.DEFAULT;
    this.logger = new Logger(`${this.constructor.name}:${this.clientId}`);
  }

  abstract publish (message: BrokerPublishDto): Promise<void>;

  abstract queueDepth (queue: QueueNameDto): Promise<number>;

  abstract replayDeadLetters (replay: ReplayDeadLettersDto): Promise<number>;

  protected abstract consume (subscription: BrokerSubscribeDto): Promise<void>;

  protected abstract cancel (queue: QueueNameDto): Promise<void>;

  async subscribe (subscription: BrokerSubscribeDto): Promise<void> {
    this.subscriptions.push(subscription);
    await this.consume(subscription);
  }

  async unsubscribe ({ queue }: QueueNameDto): Promise<void> {
    const index = this.subscriptions.findIndex(subscription => subscription.queue === queue);
    if (index >= 0) this.subscriptions.splice(index, 1);
    await this.cancel({ queue });
  }

  protected async track (work: Promise<void>): Promise<void> {
    this.inFlight += 1;

    try {
      await work;
    } finally {
      this.inFlight -= 1;
    }
  }

  protected drain (): Promise<void> {
    return DrainHelper.drain({ pending: () => this.inFlight, logger: this.logger });
  }

  protected deliver ({ queue, payload, eventId, handler, inbox }: BrokerDeliveryDto): Promise<void> {
    return RequestScope.runSystem(async () => {
      if (!inbox || !eventId) {
        await handler(payload);
        return;
      }

      if (!(await inbox.markProcessed({ consumer: queue, messageId: eventId, topic: queue }))) {
        this.logger.log(`${queue} already handled ${eventId}, skipping the replay`);
        return;
      }

      try {
        await handler(payload);
      } catch (error) {
        await this.release({ queue, eventId, inbox });
        throw error;
      }
    });
  }

  private async release ({ queue, eventId, inbox }: InboxReleaseDto): Promise<void> {
    try {
      await inbox.release({ consumer: queue, messageId: eventId });
    } catch (error) {
      this.logger.error(`Could not release ${eventId} on ${queue}, so its retry will be skipped: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }
}

import type { ConfigService } from '@nestjs/config';

import { BaseMessageBroker } from '../../src/modules/brokers/base/base-message.broker';
import { BrokerDeliveryDto } from '../../src/modules/dtos/broker/broker-delivery.dto';
import { BrokerSubscribeDto } from '../../src/modules/dtos/broker/broker-subscribe.dto';
import { QueueNameDto } from '../../src/modules/dtos/broker/queue-name.dto';

export class RecordingBroker extends BaseMessageBroker {
  readonly consumed: string[] = [];
  readonly cancelled: string[] = [];

  constructor () {
    super({ configService: {} as ConfigService });
  }

  publish (): Promise<void> {
    return Promise.resolve();
  }

  queueDepth (): Promise<number> {
    return Promise.resolve(this.subscriptions.length);
  }

  replayDeadLetters (): Promise<number> {
    return Promise.resolve(0);
  }

  run (delivery: BrokerDeliveryDto): Promise<void> {
    return this.track(this.deliver(delivery));
  }

  pending (): number {
    return this.inFlight;
  }

  protected consume ({ queue }: BrokerSubscribeDto): Promise<void> {
    this.consumed.push(queue);
    return Promise.resolve();
  }

  protected cancel ({ queue }: QueueNameDto): Promise<void> {
    this.cancelled.push(queue);
    return Promise.resolve();
  }
}

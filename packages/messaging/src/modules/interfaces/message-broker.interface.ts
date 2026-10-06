import { BrokerPublishDto } from '../dtos/broker/broker-publish.dto';
import { BrokerSubscribeDto } from '../dtos/broker/broker-subscribe.dto';
import { QueueNameDto } from '../dtos/broker/queue-name.dto';
import { ReplayDeadLettersDto } from '../dtos/broker/replay-dead-letters.dto';

export interface MessageBroker {
  publish(message: BrokerPublishDto): Promise<void>;
  subscribe(subscription: BrokerSubscribeDto): Promise<void>;
  unsubscribe(queue: QueueNameDto): Promise<void>;
  queueDepth(queue: QueueNameDto): Promise<number>;
  replayDeadLetters(replay: ReplayDeadLettersDto): Promise<number>;
}

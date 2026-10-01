import { KAFKA_CONSUMER } from '../constants/messaging/consumer.constant';
import { TopicNameDto } from '../dtos/step/topic-name.dto';

export class TopicHelper {
  static retryTopic ({ topic }: TopicNameDto): string {
    return `${topic}.${KAFKA_CONSUMER.RETRY_SUFFIX}`;
  }

  static deadLetterTopic ({ topic }: TopicNameDto): string {
    return `${topic}.${KAFKA_CONSUMER.DLQ_SUFFIX}`;
  }

  static isRetryTopic ({ topic }: TopicNameDto): boolean {
    return topic.endsWith(`.${KAFKA_CONSUMER.RETRY_SUFFIX}`);
  }

  static originTopic ({ topic }: TopicNameDto): string {
    return TopicHelper.isRetryTopic({ topic }) ? topic.slice(0, -(KAFKA_CONSUMER.RETRY_SUFFIX.length + 1)) : topic;
  }
}

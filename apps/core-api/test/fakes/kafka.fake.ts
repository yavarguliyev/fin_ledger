import { KafkaMessage } from 'kafkajs';

import { KafkaMessageFakeDto } from '../interfaces/fakes.interface';

export const aKafkaMessage = ({ key, value, timestamp, offset, headers }: KafkaMessageFakeDto): KafkaMessage =>
  ({ key, value, timestamp, offset, headers }) as unknown as KafkaMessage;

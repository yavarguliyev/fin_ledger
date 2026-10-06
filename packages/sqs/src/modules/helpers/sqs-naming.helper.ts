import { QueueNameDto } from '@common/messaging';

import { SQS_CONSTANTS as C } from '../constants/sqs/sqs.constant';
import { QueueAddressDto } from '../dtos/step/queue-address.dto';

export class SqsNamingHelper {
  static queueName ({ prefix, queue }: QueueAddressDto): string {
    return `${prefix}${C.NAME_SEPARATOR}${queue.replace(C.NAME_INVALID_CHARACTERS, C.NAME_SEPARATOR)}`;
  }

  static deadLetterQueue ({ queue }: QueueNameDto): string {
    return `${queue}${C.NAME_SEPARATOR}${C.DEAD_LETTER_SUFFIX}`;
  }
}

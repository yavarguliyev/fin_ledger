import type { MessageAttributeValue } from '@aws-sdk/client-sqs';
import { EVENT_ENVELOPE } from '@common/contracts';
import { BrokerPublishDto } from '@common/messaging';

import { SQS_CONSTANTS as C } from '../constants/sqs/sqs.constant';
import { MessageAttributesDto } from '../dtos/step/message-attributes.dto';

export class SqsAttributesHelper {
  static fromPublish ({ routingKey, headers }: BrokerPublishDto): Record<string, MessageAttributeValue> {
    const entries = Object.entries({ ...headers, [C.ROUTING_KEY_ATTRIBUTE]: routingKey });

    return Object.fromEntries(entries.map(([name, value]) => [name, { DataType: C.STRING_TYPE, StringValue: value }]));
  }

  static toRecord ({ attributes }: MessageAttributesDto): Record<string, string> {
    return Object.fromEntries(Object.entries(attributes ?? {}).flatMap(([name, value]) => (value.StringValue ? [[name, value.StringValue]] : [])));
  }

  static eventId ({ attributes }: MessageAttributesDto): string | undefined {
    return attributes?.[EVENT_ENVELOPE.HEADERS.ID]?.StringValue;
  }
}

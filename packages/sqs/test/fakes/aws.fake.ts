import type { Message } from '@aws-sdk/client-sqs';
import { ClientIds } from '@common/shared-libs';

import { SqsBrokerService } from '../../src/modules/services/sqs-broker.service';
import { SQS_BROKER_TEST as T } from '../constants/sqs-broker.constant';
import { aConfigService } from './config.fake';

export const SETTINGS = {
  SQS_TOPIC_ARN: T.TOPIC_ARN,
  SQS_QUEUE_PREFIX: T.PREFIX,
  SQS_ENDPOINT: T.ENDPOINT,
  SQS_ACCESS_KEY_ID: T.KEY,
  SQS_SECRET_ACCESS_KEY: T.KEY
};

export const aBroker = (): SqsBrokerService => new SqsBrokerService({ configService: aConfigService({ settings: SETTINGS }), clientId: ClientIds.WORKER });

export const aMessage = (receiveCount: string): Message => ({
  Body: JSON.stringify(T.PAYLOAD),
  ReceiptHandle: T.RECEIPT,
  MessageAttributes: { [T.EVENT_ID_HEADER]: { DataType: 'String', StringValue: T.EVENT_ID } },
  Attributes: { ApproximateReceiveCount: receiveCount }
});

export const flush = async (): Promise<void> => {
  for (let round = 0; round < T.FLUSH_ROUNDS; round += 1) await new Promise(resolve => setImmediate(resolve));
};

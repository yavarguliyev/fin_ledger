import { ChangeMessageVisibilityCommand, DeleteMessageCommand, Message } from '@aws-sdk/client-sqs';
import { ClientIds } from '@common/shared-libs';

import { SqsQueueConsumerService } from '../../src/modules/services/sqs-queue-consumer.service';
import { SQS_BROKER_TEST as T } from '../constants/sqs-broker.constant';
import { SETTINGS, flush } from '../fakes/aws.fake';
import { aConfigService } from '../fakes/config.fake';
import { answer, sentOf } from '../fakes/sqs-client.fake';

const sqsSend = jest.fn();

jest.mock('@aws-sdk/client-sqs', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-sqs')>('@aws-sdk/client-sqs');
  return { ...actual, SQSClient: jest.fn(() => ({ send: sqsSend, destroy: jest.fn() })) };
});

const rawMessage = (receiveCount: string): Message => ({
  Body: T.RAW_BODY,
  ReceiptHandle: T.RECEIPT,
  MessageAttributes: { [T.PROVIDER_ATTRIBUTE]: { DataType: 'String', StringValue: T.PROVIDER } },
  Attributes: { ApproximateReceiveCount: receiveCount }
});

const consumeOnce = async (handler: jest.Mock): Promise<void> => {
  answer(sqsSend, [[rawMessage(T.SECOND_ATTEMPT)]], true);
  const consumer = new SqsQueueConsumerService({ configService: aConfigService({ settings: SETTINGS }), clientId: ClientIds.WORKER });

  await consumer.start({ queueName: T.WEBHOOK_QUEUE, handler });
  await flush();
  await consumer.stop();
};

describe('SqsQueueConsumerService', () => {
  afterEach(() => jest.clearAllMocks());

  it('hands the handler the untouched body and the attributes, then deletes the message', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    await consumeOnce(handler);

    expect(handler).toHaveBeenCalledWith({ body: T.RAW_BODY, attributes: { [T.PROVIDER_ATTRIBUTE]: T.PROVIDER } });
    expect(sentOf(sqsSend, DeleteMessageCommand)).toHaveLength(1);
  });

  it('keeps a failed message and schedules the retry for its attempt', async () => {
    await consumeOnce(jest.fn().mockRejectedValue(new Error(T.FAILURE)));

    expect(sentOf(sqsSend, DeleteMessageCommand)).toHaveLength(0);
    expect(sentOf(sqsSend, ChangeMessageVisibilityCommand)[0]?.input.VisibilityTimeout).toBe(T.SECOND_DELAY);
  });
});

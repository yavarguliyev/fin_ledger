import { DeleteMessageCommand, GetQueueUrlCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ClientIds } from '@common/shared-libs';

import { SqsBrokerService } from '../../src/modules/services/sqs-broker.service';
import { SQS_CONSTANTS as C } from '../../src/modules/constants/sqs/sqs.constant';
import { SQS_BROKER_TEST as T } from '../constants/sqs-broker.constant';
import { aBroker, aMessage } from '../fakes/aws.fake';
import { aConfigService } from '../fakes/config.fake';
import { answer, sentOf } from '../fakes/sqs-client.fake';

const sqsSend = jest.fn();

jest.mock('@aws-sdk/client-sqs', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-sqs')>('@aws-sdk/client-sqs');
  return { ...actual, SQSClient: jest.fn(() => ({ send: sqsSend, destroy: jest.fn() })) };
});

describe('SqsBrokerService queues', () => {
  afterEach(() => jest.clearAllMocks());

  it('maps a RabbitMQ-style dead-letter name to the Terraform queue and reads its depth', async () => {
    answer(sqsSend, [], false);

    await expect(aBroker().queueDepth({ queue: T.DLQ })).resolves.toBe(Number(T.DEPTH));
    expect(sentOf(sqsSend, GetQueueUrlCommand)[0]?.input.QueueName).toBe(T.PHYSICAL_DLQ);
  });

  it('moves dead letters back to their queue and deletes them from the dead-letter queue', async () => {
    answer(sqsSend, [[aMessage(T.LAST_ATTEMPT), aMessage(T.LAST_ATTEMPT)]], false);

    await expect(aBroker().replayDeadLetters({ queue: T.QUEUE })).resolves.toBe(2);

    expect(sentOf(sqsSend, SendMessageCommand).map(({ input }) => input.QueueUrl)).toEqual([
      `${T.QUEUE_URL}/${T.PHYSICAL_QUEUE}`,
      `${T.QUEUE_URL}/${T.PHYSICAL_QUEUE}`
    ]);
    expect(sentOf(sqsSend, DeleteMessageCommand)[0]?.input.QueueUrl).toBe(`${T.QUEUE_URL}/${T.PHYSICAL_DLQ}`);
  });

  it('refuses to start without a topic', () => {
    const configService = aConfigService({ settings: { SQS_QUEUE_PREFIX: T.PREFIX } });

    expect(() => new SqsBrokerService({ configService, clientId: ClientIds.WORKER })).toThrow(C.MISSING_TOPIC);
  });
});

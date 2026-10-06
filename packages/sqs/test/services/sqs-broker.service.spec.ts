import { ChangeMessageVisibilityCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { PublishCommand } from '@aws-sdk/client-sns';

import { SQS_BROKER_TEST as T } from '../constants/sqs-broker.constant';
import { aBroker, aMessage, flush } from '../fakes/aws.fake';
import { answer, sentOf } from '../fakes/sqs-client.fake';

const sqsSend = jest.fn();
const snsSend = jest.fn().mockResolvedValue({});

jest.mock('@aws-sdk/client-sqs', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-sqs')>('@aws-sdk/client-sqs');
  return { ...actual, SQSClient: jest.fn(() => ({ send: sqsSend, destroy: jest.fn() })) };
});

jest.mock('@aws-sdk/client-sns', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-sns')>('@aws-sdk/client-sns');
  return { ...actual, SNSClient: jest.fn(() => ({ send: snsSend, destroy: jest.fn() })) };
});

const consumeOnce = async (receiveCount: string, handler: jest.Mock): Promise<void> => {
  answer(sqsSend, [[aMessage(receiveCount)]], true);
  const broker = aBroker();

  await broker.subscribe({ queue: T.QUEUE, routingKey: T.ROUTING_KEY, handler });
  await flush();
  await broker.onModuleDestroy();
};

describe('SqsBrokerService', () => {
  afterEach(() => jest.clearAllMocks());

  it('publishes the payload to the topic with the routing key and envelope headers as attributes', async () => {
    await aBroker().publish({ payload: T.PAYLOAD, routingKey: T.ROUTING_KEY, headers: { [T.EVENT_ID_HEADER]: T.EVENT_ID } });

    const [command] = sentOf(snsSend, PublishCommand);
    expect(command?.input).toMatchObject({
      TopicArn: T.TOPIC_ARN,
      Message: JSON.stringify(T.PAYLOAD),
      MessageAttributes: { routing_key: { StringValue: T.ROUTING_KEY }, [T.EVENT_ID_HEADER]: { StringValue: T.EVENT_ID } }
    });
  });

  it('polls the prefixed queue, handles the message and deletes it', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    await consumeOnce(T.SECOND_ATTEMPT, handler);

    expect(handler).toHaveBeenCalledWith(T.PAYLOAD);
    expect(sentOf(sqsSend, DeleteMessageCommand)[0]?.input).toMatchObject({ QueueUrl: `${T.QUEUE_URL}/${T.PHYSICAL_QUEUE}`, ReceiptHandle: T.RECEIPT });
  });

  it('keeps a failed message and retries it after the delay for its attempt', async () => {
    await consumeOnce(T.SECOND_ATTEMPT, jest.fn().mockRejectedValue(new Error(T.FAILURE)));

    expect(sentOf(sqsSend, DeleteMessageCommand)).toHaveLength(0);
    expect(sentOf(sqsSend, ChangeMessageVisibilityCommand)[0]?.input.VisibilityTimeout).toBe(T.SECOND_DELAY);
  });

  it('releases a message that failed its last attempt so the redrive policy moves it to the dead-letter queue', async () => {
    await consumeOnce(T.LAST_ATTEMPT, jest.fn().mockRejectedValue(new Error(T.FAILURE)));

    expect(sentOf(sqsSend, ChangeMessageVisibilityCommand)[0]?.input.VisibilityTimeout).toBe(T.NO_DELAY);
  });
});

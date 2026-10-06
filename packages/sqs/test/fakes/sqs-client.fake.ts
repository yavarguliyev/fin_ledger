import { GetQueueUrlCommand, Message, ReceiveMessageCommand } from '@aws-sdk/client-sqs';

import { SQS_BROKER_TEST as T } from '../constants/sqs-broker.constant';

export const answer = (send: jest.Mock, batches: Message[][], pending: boolean): void => {
  send.mockImplementation((command: object) => {
    if (command instanceof GetQueueUrlCommand) return Promise.resolve({ QueueUrl: `${T.QUEUE_URL}/${command.input.QueueName}` });
    if (!(command instanceof ReceiveMessageCommand)) return Promise.resolve({ Attributes: { ApproximateNumberOfMessages: T.DEPTH } });

    const batch = batches.shift();
    if (batch) return Promise.resolve({ Messages: batch });

    return pending ? new Promise(() => undefined) : Promise.resolve({ Messages: [] });
  });
};

export const sentOf = <T>(send: jest.Mock, type: new (...args: never[]) => T): T[] =>
  send.mock.calls.map(([command]: [unknown]) => command).filter((command): command is T => command instanceof type);

import { Logger } from '@nestjs/common';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { EVENT_ENVELOPE } from '@common/contracts';

import { ConsumeHelper } from '../../src/modules/helpers/consume.helper';
import { CONSUME_INBOX_TEST as T } from '../constants/consume-inbox.constant';

const ack = jest.fn();
const channel = { ack, nack: jest.fn() } as unknown as ConfirmChannel;
const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as unknown as Logger;

const messageWith = (headers: Record<string, string>): ConsumeMessage =>
  ({ content: Buffer.from(JSON.stringify(T.PAYLOAD)), properties: { headers }, fields: {} }) as unknown as ConsumeMessage;

describe('ConsumeHelper', () => {
  afterEach(() => jest.clearAllMocks());

  it('hands the payload and the envelope event id to the broker, then acknowledges', async () => {
    const deliver = jest.fn().mockResolvedValue(undefined);

    await ConsumeHelper.handle({ channel, queue: T.QUEUE, message: messageWith({ [EVENT_ENVELOPE.HEADERS.ID]: T.EVENT_ID }), deliver, logger });

    expect(deliver).toHaveBeenCalledWith({ payload: T.PAYLOAD, eventId: T.EVENT_ID });
    expect(ack).toHaveBeenCalledTimes(1);
  });

  it('delivers a message without an event id and leaves the id out', async () => {
    const deliver = jest.fn().mockResolvedValue(undefined);

    await ConsumeHelper.handle({ channel, queue: T.QUEUE, message: messageWith({}), deliver, logger });

    expect(deliver).toHaveBeenCalledWith({ payload: T.PAYLOAD });
  });
});

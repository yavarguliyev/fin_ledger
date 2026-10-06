import { Logger } from '@nestjs/common';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { EVENT_ENVELOPE } from '@common/contracts';
import type { InboxRepository } from '@common/database';

import { ConsumeHelper } from '../../src/modules/helpers/consume.helper';
import { CONSUME_INBOX_TEST as T } from '../constants/consume-inbox.constant';

const ack = jest.fn();
const markProcessed = jest.fn();
const release = jest.fn().mockResolvedValue(undefined);
const channel = { ack, nack: jest.fn() } as unknown as ConfirmChannel;
const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as unknown as Logger;

const messageWith = (headers: Record<string, string>): ConsumeMessage =>
  ({ content: Buffer.from(JSON.stringify(T.PAYLOAD)), properties: { headers }, fields: {} }) as unknown as ConsumeMessage;

const inboxThat = (processed: boolean): InboxRepository => {
  markProcessed.mockResolvedValue(!processed);
  return { markProcessed, release } as unknown as InboxRepository;
};

const withEventId = messageWith({ [EVENT_ENVELOPE.HEADERS.ID]: T.EVENT_ID });

describe('ConsumeHelper inbox', () => {
  afterEach(() => jest.clearAllMocks());

  it('claims a new event in the inbox before handling it', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const inbox = inboxThat(false);

    await ConsumeHelper.handle({ channel, queue: T.QUEUE, message: withEventId, handler, logger, inbox });

    expect(handler).toHaveBeenCalledWith(T.PAYLOAD);
    expect(markProcessed).toHaveBeenCalledWith({ consumer: T.QUEUE, messageId: T.EVENT_ID, topic: T.QUEUE });
    expect(ack).toHaveBeenCalledTimes(1);
  });

  it('acknowledges a replayed event without running the handler again', async () => {
    const handler = jest.fn();
    const inbox = inboxThat(true);

    await ConsumeHelper.handle({ channel, queue: T.QUEUE, message: withEventId, handler, logger, inbox });

    expect(handler).not.toHaveBeenCalled();
    expect(ack).toHaveBeenCalledTimes(1);
  });

  it('releases the claim when the handler fails, so a retry can handle it', async () => {
    const handler = jest.fn().mockRejectedValue(new Error(T.FAILURE));
    const inbox = inboxThat(false);

    await ConsumeHelper.handle({ channel, queue: T.QUEUE, message: withEventId, handler, logger, inbox });

    expect(release).toHaveBeenCalledWith({ consumer: T.QUEUE, messageId: T.EVENT_ID });
  });

  it('still handles a message that carries no event id', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const inbox = inboxThat(true);

    await ConsumeHelper.handle({ channel, queue: T.QUEUE, message: messageWith({}), handler, logger, inbox });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(markProcessed).not.toHaveBeenCalled();
  });
});

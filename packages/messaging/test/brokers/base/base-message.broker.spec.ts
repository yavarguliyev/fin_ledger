import type { InboxRepository } from '@common/database';

import { BASE_BROKER_TEST as T } from '../../constants/base-broker.constant';
import { RecordingBroker } from '../../fakes/recording.broker';

const markProcessed = jest.fn();
const release = jest.fn().mockResolvedValue(undefined);

const inboxThat = (processed: boolean): InboxRepository => {
  markProcessed.mockResolvedValue(!processed);
  return { markProcessed, release } as unknown as InboxRepository;
};

describe('BaseMessageBroker', () => {
  afterEach(() => jest.clearAllMocks());

  it('claims a new event in the inbox before handling it', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    await new RecordingBroker().run({ queue: T.QUEUE, payload: T.PAYLOAD, eventId: T.EVENT_ID, handler, inbox: inboxThat(false) });

    expect(handler).toHaveBeenCalledWith(T.PAYLOAD);
    expect(markProcessed).toHaveBeenCalledWith({ consumer: T.QUEUE, messageId: T.EVENT_ID, topic: T.QUEUE });
  });

  it('skips a replayed event without running the handler again', async () => {
    const handler = jest.fn();

    await new RecordingBroker().run({ queue: T.QUEUE, payload: T.PAYLOAD, eventId: T.EVENT_ID, handler, inbox: inboxThat(true) });

    expect(handler).not.toHaveBeenCalled();
  });

  it('releases the claim and rethrows when the handler fails, so a retry can handle it', async () => {
    const handler = jest.fn().mockRejectedValue(new Error(T.FAILURE));
    const broker = new RecordingBroker();

    await expect(broker.run({ queue: T.QUEUE, payload: T.PAYLOAD, eventId: T.EVENT_ID, handler, inbox: inboxThat(false) })).rejects.toThrow(T.FAILURE);

    expect(release).toHaveBeenCalledWith({ consumer: T.QUEUE, messageId: T.EVENT_ID });
    expect(broker.pending()).toBe(0);
  });

  it('keeps the handler error when releasing the claim fails too', async () => {
    const handler = jest.fn().mockRejectedValue(new Error(T.FAILURE));
    const inbox = inboxThat(false);
    release.mockRejectedValueOnce(new Error(T.RELEASE_FAILURE));

    await expect(new RecordingBroker().run({ queue: T.QUEUE, payload: T.PAYLOAD, eventId: T.EVENT_ID, handler, inbox })).rejects.toThrow(T.FAILURE);
  });

  it('handles a message without an event id without touching the inbox', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    await new RecordingBroker().run({ queue: T.QUEUE, payload: T.PAYLOAD, handler, inbox: inboxThat(true) });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(markProcessed).not.toHaveBeenCalled();
  });
});

describe('BaseMessageBroker subscriptions', () => {
  it('remembers subscriptions for reconnects and forgets them on unsubscribe', async () => {
    const broker = new RecordingBroker();
    const handler = jest.fn();

    await broker.subscribe({ queue: T.QUEUE, routingKey: T.ROUTING_KEY, handler });
    await broker.subscribe({ queue: T.OTHER_QUEUE, routingKey: T.ROUTING_KEY, handler });
    await broker.unsubscribe({ queue: T.QUEUE });

    expect(broker.consumed).toEqual([T.QUEUE, T.OTHER_QUEUE]);
    expect(broker.cancelled).toEqual([T.QUEUE]);
    await expect(broker.queueDepth()).resolves.toBe(1);
  });
});

import { QueueHelper } from '../modules/helpers/queue.helper';
import { RABBITMQ_TOPOLOGY } from '../modules/constants/messaging/topology.constant';

const QUEUE = 'notifications.wallet.credited';

describe('QueueHelper', () => {
  it('names the retry ladder and dead-letter queue after the origin queue', () => {
    expect(QueueHelper.retryQueue({ queue: QUEUE, attempt: 1 })).toBe(`${QUEUE}.retry.1`);
    expect(QueueHelper.retryQueue({ queue: QUEUE, attempt: 3 })).toBe(`${QUEUE}.retry.3`);
    expect(QueueHelper.deadLetterQueue({ queue: QUEUE })).toBe(`${QUEUE}.dlq`);
  });

  it('grows the delay with every attempt', () => {
    const delays = RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.map((_delay, index) => QueueHelper.retryDelay({ attempt: index + 1 }));

    expect(delays).toEqual([...RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS]);
    delays.forEach((delay, index) => index > 0 && expect(delay).toBeGreaterThan(delays[index - 1] as number));
  });

  it('holds at the last delay rather than running off the ladder', () => {
    const beyond = RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length + 5;
    const last = RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS[RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length - 1];

    expect(QueueHelper.retryDelay({ attempt: beyond })).toBe(last);
  });

  it('treats an attempt past the ladder as exhausted', () => {
    expect(QueueHelper.isExhausted({ attempt: RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length })).toBe(false);
    expect(QueueHelper.isExhausted({ attempt: RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length + 1 })).toBe(true);
  });
});

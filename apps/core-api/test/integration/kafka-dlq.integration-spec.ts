import { Logger } from '@nestjs/common';
import { EachMessagePayload, KafkaMessage } from 'kafkajs';
import { DispatchHelper, KAFKA_CONSUMER, KafkaSendDto, TopicHelper } from '@common/kafka';
import { InboxRepository } from '@common/database';
import { CryptoHelper } from '@common/shared-libs';

import { DbHelper } from '../helpers/db.helper';

const CONSUMER_GROUP = 'integration-dispatch';

interface ParkedMessage {
  topic: string;
  headers: Record<string, string>;
}

describe('Kafka retry and dead-letter handling', () => {
  let topic: string;
  let inboxRepository: InboxRepository;

  const logger = new Logger('KafkaDlqSpec');
  const parked: ParkedMessage[] = [];

  const send = async ({ topic: target, headers }: KafkaSendDto): Promise<void> => {
    parked.push({ topic: target, headers: Object.fromEntries(Object.entries(headers ?? {}).map(([key, value]) => [key, String(value)])) });
    await Promise.resolve();
  };

  const payloadFor = ({ source, headers }: { source: string; headers?: Record<string, string> }): EachMessagePayload => ({
    topic: source,
    partition: 0,
    message: {
      key: Buffer.from('probe-key'),
      value: Buffer.from(JSON.stringify({ probe: true })),
      timestamp: String(Date.now()),
      offset: '42',
      headers: Object.fromEntries(Object.entries(headers ?? {}).map(([key, value]) => [key, Buffer.from(value)]))
    } as unknown as KafkaMessage,
    heartbeat: () => Promise.resolve(),
    pause: () => () => undefined
  });

  const record = { topic: '', partition: 0, value: { probe: true }, key: 'probe-key', timestamp: String(Date.now()) };

  const context = (): {
    send: (message: KafkaSendDto) => Promise<void>;
    consumerGroup: string;
    inboxRepository: InboxRepository;
    logger: Logger;
  } => ({
    send,
    consumerGroup: CONSUMER_GROUP,
    inboxRepository,
    logger
  });

  beforeAll(() => {
    const connection = {
      query: async ({ sql, params }: { sql: string; params?: unknown[] }) => ({ rows: await DbHelper.query({ sql, ...(params && { params }) }) })
    };

    inboxRepository = new InboxRepository({ getConnection: () => connection } as never);
  });

  beforeEach(() => {
    topic = `probe.${CryptoHelper.uuid()}`;
    parked.length = 0;
  });

  afterAll(async () => {
    await DbHelper.query({ sql: "DELETE FROM inbox_messages WHERE consumer LIKE 'integration-dispatch%'" });
    await DbHelper.close();
  });

  it('runs every handler even when one of them keeps throwing', async () => {
    const calls: string[] = [];

    const failing = function failing(): Promise<void> {
      calls.push('failing');
      return Promise.reject(new Error('handler always throws'));
    };

    const healthy = function healthy(): Promise<void> {
      calls.push('healthy');
      return Promise.resolve();
    };

    await DispatchHelper.runAll({ handlers: [failing, healthy], record: { ...record, topic }, payload: payloadFor({ source: topic }), ...context() });

    expect(calls).toContain('healthy');
    expect(calls.filter(call => call === 'failing')).toHaveLength(KAFKA_CONSUMER.IN_PROCESS_ATTEMPTS);
  });

  it('moves an exhausted message to the retry topic, then to the dead-letter topic, with headers', async () => {
    const failing = function failing(): Promise<void> {
      return Promise.reject(new Error('handler always throws'));
    };

    await DispatchHelper.run({ handler: failing, record: { ...record, topic }, payload: payloadFor({ source: topic }), ...context() });

    const [toRetry] = parked;

    expect(toRetry?.topic).toBe(TopicHelper.retryTopic({ topic }));
    expect(toRetry?.headers[KAFKA_CONSUMER.ATTEMPTS_HEADER]).toBe('1');
    expect(toRetry?.headers[KAFKA_CONSUMER.TOPIC_HEADER]).toBe(topic);
    expect(toRetry?.headers[KAFKA_CONSUMER.OFFSET_HEADER]).toBe('42');
    expect(toRetry?.headers[KAFKA_CONSUMER.ERROR_HEADER]).toContain('handler always throws');
    expect(toRetry?.headers[KAFKA_CONSUMER.HANDLER_HEADER]).toBe('failing');

    parked.length = 0;

    await DispatchHelper.run({
      handler: failing,
      record: { ...record, topic },
      payload: payloadFor({
        source: TopicHelper.retryTopic({ topic }),
        headers: {
          [KAFKA_CONSUMER.ATTEMPTS_HEADER]: '1',
          [KAFKA_CONSUMER.TOPIC_HEADER]: topic,
          [KAFKA_CONSUMER.PARTITION_HEADER]: '0',
          [KAFKA_CONSUMER.OFFSET_HEADER]: '42',
          [KAFKA_CONSUMER.RETRY_AT_HEADER]: String(Date.now())
        }
      }),
      ...context()
    });

    const [toDeadLetter] = parked;

    expect(toDeadLetter?.topic).toBe(TopicHelper.deadLetterTopic({ topic }));
    expect(toDeadLetter?.headers[KAFKA_CONSUMER.ATTEMPTS_HEADER]).toBe('2');
    expect(toDeadLetter?.headers[KAFKA_CONSUMER.OFFSET_HEADER]).toBe('42');
  });

  it('does not run a handler twice when the same message is redelivered', async () => {
    let handled = 0;

    const counting = function counting(): Promise<void> {
      handled += 1;
      return Promise.resolve();
    };

    const payload = payloadFor({ source: topic });

    await DispatchHelper.run({ handler: counting, record: { ...record, topic }, payload, ...context() });
    await DispatchHelper.run({ handler: counting, record: { ...record, topic }, payload, ...context() });

    expect(handled).toBe(1);
    expect(parked).toEqual([]);
  });

  it('records the message against the consumer that handled it', async () => {
    const counting = function counting(): Promise<void> {
      return Promise.resolve();
    };

    await DispatchHelper.run({ handler: counting, record: { ...record, topic }, payload: payloadFor({ source: topic }), ...context() });

    const rows = await DbHelper.query<{ consumer: string; message_id: string; topic: string }>({
      sql: 'SELECT consumer, message_id, topic FROM inbox_messages WHERE message_id = $1',
      params: [`${topic}:0:42`]
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.consumer).toBe(`${CONSUMER_GROUP}:counting`);
  });
});

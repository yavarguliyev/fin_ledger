import { DispatchHelper, KAFKA_CONSUMER, TopicHelper } from '@common/kafka';

import { KAFKA_DISPATCH_TEST as K } from '../constants/kafka-dispatch.constant';
import { KafkaDispatchProbe } from '../helpers/kafka-dispatch-probe.helper';

const failing = function failing (): Promise<void> {
  return Promise.reject(new Error(K.FAILURE));
};

describe('Kafka handler isolation', () => {
  const probe = KafkaDispatchProbe.useInSuite();

  it('runs every handler even when one of them keeps throwing', async () => {
    const calls: string[] = [];
    const counted = function failing (): Promise<void> {
      calls.push(K.FAILING);
      return Promise.reject(new Error(K.FAILURE));
    };
    const healthy = function healthy (): Promise<void> {
      calls.push(K.HEALTHY);
      return Promise.resolve();
    };
    const { topic } = probe();

    await DispatchHelper.runAll({
      handlers: [counted, healthy],
      record: probe().record(),
      payload: KafkaDispatchProbe.payloadFor({ source: topic }),
      ...probe().context()
    });

    expect(calls).toContain(K.HEALTHY);
    expect(calls.filter(call => call === K.FAILING)).toHaveLength(KAFKA_CONSUMER.IN_PROCESS_ATTEMPTS);
  });
});

describe('Kafka retry and dead-letter topics', () => {
  const probe = KafkaDispatchProbe.useInSuite();

  it('moves an exhausted message to the retry topic, then to the dead-letter topic, with headers', async () => {
    const { topic, parked } = probe();
    await DispatchHelper.run({
      handler: failing,
      record: probe().record(),
      payload: KafkaDispatchProbe.payloadFor({ source: topic }),
      ...probe().context()
    });

    const [toRetry] = parked;
    expect(toRetry?.topic).toBe(TopicHelper.retryTopic({ topic }));
    expect(toRetry?.headers).toMatchObject({
      [KAFKA_CONSUMER.ATTEMPTS_HEADER]: K.FIRST_ATTEMPT,
      [KAFKA_CONSUMER.TOPIC_HEADER]: topic,
      [KAFKA_CONSUMER.OFFSET_HEADER]: K.OFFSET,
      [KAFKA_CONSUMER.HANDLER_HEADER]: K.FAILING
    });
    expect(toRetry?.headers[KAFKA_CONSUMER.ERROR_HEADER]).toContain(K.FAILURE);

    parked.length = 0;
    const headers = {
      [KAFKA_CONSUMER.ATTEMPTS_HEADER]: K.FIRST_ATTEMPT,
      [KAFKA_CONSUMER.TOPIC_HEADER]: topic,
      [KAFKA_CONSUMER.PARTITION_HEADER]: String(K.PARTITION),
      [KAFKA_CONSUMER.OFFSET_HEADER]: K.OFFSET,
      [KAFKA_CONSUMER.RETRY_AT_HEADER]: String(Date.now())
    };
    await DispatchHelper.run({
      handler: failing,
      record: probe().record(),
      payload: KafkaDispatchProbe.payloadFor({ source: TopicHelper.retryTopic({ topic }), headers }),
      ...probe().context()
    });

    const [toDeadLetter] = parked;
    expect(toDeadLetter?.topic).toBe(TopicHelper.deadLetterTopic({ topic }));
    expect(toDeadLetter?.headers).toMatchObject({ [KAFKA_CONSUMER.ATTEMPTS_HEADER]: K.SECOND_ATTEMPT, [KAFKA_CONSUMER.OFFSET_HEADER]: K.OFFSET });
  });
});

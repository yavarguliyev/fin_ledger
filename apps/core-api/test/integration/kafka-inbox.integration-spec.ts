import { DispatchHelper } from '@common/kafka';

import { DbHelper } from '../helpers/db.helper';
import { KAFKA_DISPATCH_TEST as K } from '../constants/kafka-dispatch.constant';
import { KafkaDispatchProbe } from '../helpers/kafka-dispatch-probe.helper';
import { InboxRow } from '../interfaces/kafka-dispatch.interface';

describe('Kafka inbox', () => {
  const probe = KafkaDispatchProbe.useInSuite();

  it('does not run a handler twice when the same message is redelivered', async () => {
    let handled = 0;
    const counting = function counting (): Promise<void> {
      handled += 1;
      return Promise.resolve();
    };
    const payload = KafkaDispatchProbe.payloadFor({ source: probe().topic });

    await DispatchHelper.run({ handler: counting, record: probe().record(), payload, ...probe().context() });
    await DispatchHelper.run({ handler: counting, record: probe().record(), payload, ...probe().context() });

    expect(handled).toBe(1);
    expect(probe().parked).toEqual([]);
  });

  it('records the message against the consumer that handled it', async () => {
    const counting = function counting (): Promise<void> {
      return Promise.resolve();
    };
    const { topic } = probe();

    await DispatchHelper.run({
      handler: counting,
      record: probe().record(),
      payload: KafkaDispatchProbe.payloadFor({ source: topic }),
      ...probe().context()
    });

    const rows = await DbHelper.query<InboxRow>({ sql: K.INBOX_SQL, params: [`${topic}:${K.PARTITION}:${K.OFFSET}`] });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.consumer).toBe(`${K.CONSUMER_GROUP}:${K.COUNTING}`);
  });
});

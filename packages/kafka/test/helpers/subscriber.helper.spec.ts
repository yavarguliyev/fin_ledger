import { Logger } from '@nestjs/common';

import { DispatchHelper } from '../../src/modules/helpers/dispatch.helper';
import { SubscriberHelper } from '../../src/modules/helpers/subscriber.helper';
import { KafkaMessageRecord } from '../../src/modules/interfaces/kafka-message-record.interface';
import { SUBSCRIBER_SPEC as S } from '../constants/subscriber.constant';
import { aMemoryInbox, anEachMessagePayload } from '../fakes/kafka.fake';

class AuditListener {
  readonly seen: string[] = [];

  handle ({ topic }: KafkaMessageRecord): void {
    this.seen.push(topic);
  }
}

class AnalyticsListener {
  readonly seen: string[] = [];

  handle ({ topic }: KafkaMessageRecord): void {
    this.seen.push(topic);
  }
}

describe('SubscriberHelper', () => {
  it('names a handler after its class and method', () => {
    expect(SubscriberHelper.bind({ instance: new AuditListener(), methodName: S.METHOD })?.name).toBe(S.AUDIT_NAME);
  });

  it('returns null for a method the instance does not have', () => {
    expect(SubscriberHelper.bind({ instance: new AuditListener(), methodName: S.MISSING })).toBeNull();
  });

  it('runs two same-named methods from different classes on one topic, each exactly once', async () => {
    const audit = new AuditListener();
    const analytics = new AnalyticsListener();
    const handlers = [audit, analytics].map(instance => SubscriberHelper.bind({ instance, methodName: S.METHOD })!);
    const payload = anEachMessagePayload({ topic: S.TOPIC, partition: S.PARTITION, offset: S.OFFSET });
    const context = {
      handlers,
      record: { topic: S.TOPIC } as KafkaMessageRecord,
      payload,
      send: (): Promise<void> => Promise.resolve(),
      consumerGroup: S.GROUP,
      inboxRepository: aMemoryInbox(),
      logger: new Logger(S.GROUP)
    };

    await DispatchHelper.runAll(context);
    await DispatchHelper.runAll(context);

    expect(handlers.map(handler => handler.name)).toEqual([S.AUDIT_NAME, S.ANALYTICS_NAME]);
    expect(audit.seen).toEqual([S.TOPIC]);
    expect(analytics.seen).toEqual([S.TOPIC]);
  });
});

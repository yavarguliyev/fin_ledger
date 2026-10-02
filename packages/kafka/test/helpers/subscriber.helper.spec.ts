import { Logger } from '@nestjs/common';
import type { InboxRepository } from '@common/database';
import type { EachMessagePayload } from 'kafkajs';

import { DispatchHelper } from '../../src/modules/helpers/dispatch.helper';
import { SubscriberHelper } from '../../src/modules/helpers/subscriber.helper';
import { KafkaMessageRecord } from '../../src/modules/interfaces/kafka-message-record.interface';
import { SUBSCRIBER_SPEC as S } from '../constants/subscriber.constant';

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

type InboxEntry = Parameters<InboxRepository['wasProcessed']>[0];

const memoryInbox = (): InboxRepository => {
  const processed = new Set<string>();

  return {
    wasProcessed: ({ consumer, messageId }: InboxEntry) => Promise.resolve(processed.has(`${consumer}|${messageId}`)),
    markProcessed: ({ consumer, messageId }: InboxEntry) => {
      processed.add(`${consumer}|${messageId}`);
      return Promise.resolve();
    }
  } as unknown as InboxRepository;
};

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
    const payload = { topic: S.TOPIC, partition: S.PARTITION, message: { offset: S.OFFSET, headers: {}, value: null, key: null } } as unknown as EachMessagePayload;
    const context = {
      handlers,
      record: { topic: S.TOPIC } as KafkaMessageRecord,
      payload,
      send: (): Promise<void> => Promise.resolve(),
      consumerGroup: S.GROUP,
      inboxRepository: memoryInbox(),
      logger: new Logger(S.GROUP)
    };

    await DispatchHelper.runAll(context);
    await DispatchHelper.runAll(context);

    expect(handlers.map(handler => handler.name)).toEqual([S.AUDIT_NAME, S.ANALYTICS_NAME]);
    expect(audit.seen).toEqual([S.TOPIC]);
    expect(analytics.seen).toEqual([S.TOPIC]);
  });
});

import { EVENT_ENVELOPE, EventEnvelopeSchema } from '@common/contracts';
import { KafkaSendDto } from '@common/kafka';
import { OutboxDestination } from '@common/shared-libs';

import { OutboxPublisherService } from '../../src/modules/services/outbox-publisher.service';
import { RabbitmqPublishDto } from '../../src/modules/dtos/service/rabbitmq-publish.dto';
import { OUTBOX_ENVELOPE_TEST as T } from '../constants/outbox-envelope.constant';
import { EnvelopeRelayFixture } from '../interfaces/outbox-envelope.interface';

const relay = (): EnvelopeRelayFixture => {
  const repository = { markPublished: jest.fn().mockResolvedValue(undefined), rescheduleFailed: jest.fn() };
  const kafka = { send: jest.fn<Promise<void>, [KafkaSendDto]>().mockResolvedValue(undefined) };
  const rabbit = { publish: jest.fn<Promise<void>, [RabbitmqPublishDto]>().mockResolvedValue(undefined) };
  return { service: new OutboxPublisherService(repository as never, rabbit as never, kafka as never), kafka, rabbit };
};

const event = {
  eventId: T.EVENT_ID,
  eventType: T.EVENT_TYPE,
  payload: {},
  attempts: 0,
  occurredAt: new Date(T.OCCURRED_AT),
  correlationId: T.CORRELATION_ID
};

describe('Outbox relay event envelope', () => {
  it('stamps every Kafka message with a versioned envelope that matches the contract', async () => {
    const { service, kafka } = relay();
    await service.publishEvent({ ...event, destination: OutboxDestination.KAFKA });

    const headers = (kafka.send.mock.calls[0]?.[0].headers ?? {}) as Record<string, string>;
    expect(headers).toEqual({
      [T.TYPE_HEADER]: T.EVENT_TYPE,
      [T.VERSION_HEADER]: String(EVENT_ENVELOPE.CURRENT_VERSION),
      [T.ID_HEADER]: T.EVENT_ID,
      [T.OCCURRED_HEADER]: T.OCCURRED_AT,
      [T.CORRELATION_HEADER]: T.CORRELATION_ID
    });
    expect(
      EventEnvelopeSchema.safeParse({
        type: headers[T.TYPE_HEADER],
        version: headers[T.VERSION_HEADER],
        id: headers[T.ID_HEADER],
        occurredAt: headers[T.OCCURRED_HEADER],
        correlationId: headers[T.CORRELATION_HEADER]
      }).success
    ).toBe(true);
  });

  it('sends the same envelope as RabbitMQ headers, leaving the payload untouched', async () => {
    const { service, rabbit } = relay();
    await service.publishEvent({ ...event, destination: OutboxDestination.BROKER });

    const sent = rabbit.publish.mock.calls[0]?.[0];
    expect(sent?.payload).toEqual({});
    expect(sent?.headers?.[T.ID_HEADER]).toBe(T.EVENT_ID);
  });
});

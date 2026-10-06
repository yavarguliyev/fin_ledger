import { QueueHelper, RABBITMQ_TOPOLOGY } from '@common/rabbitmq';

import { RABBIT_PROBE as R } from '../constants/rabbit-probe.constant';
import { RabbitProbe } from '../helpers/rabbit-probe.helper';

describe('RabbitMQ retry ladder', () => {
  const probe = RabbitProbe.useInSuite();

  it('moves a failing message onto the retry ladder instead of dropping it', async () => {
    const { queue, routingKey, service } = probe();
    const consumer = await probe().failingConsumer();
    await service.publish({ payload: R.PAYLOAD, routingKey });

    await expect(probe().waitForDepth({ target: QueueHelper.retryQueue({ queue, attempt: 1 }), expected: 1 })).resolves.toBe(1);
    expect(await service.queueDepth({ queue: QueueHelper.deadLetterQueue({ queue }) })).toBe(0);
    await consumer.onModuleDestroy();
  });

  it('parks a message in the dead-letter queue once the ladder is exhausted', async () => {
    const consumer = await probe().failingConsumer();
    await probe().seedWithAttempts({ attempt: RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length });

    await expect(probe().waitForDepth({ target: QueueHelper.deadLetterQueue({ queue: probe().queue }), expected: 1 })).resolves.toBe(1);
    await consumer.onModuleDestroy();
  });

  it('uses a strictly growing delay for each rung of the retry ladder', () => {
    const delays = RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.map((_, index) => QueueHelper.retryDelay({ attempt: index + 1 }));

    expect(delays).toEqual([...delays].sort((first, second) => first - second));
    expect(new Set(delays).size).toBe(delays.length);
  });
});

describe('RabbitMQ dead letters', () => {
  const probe = RabbitProbe.useInSuite();

  it('replays a dead-lettered message back to its queue exactly once', async () => {
    const { queue, service } = probe();
    const consumer = await probe().failingConsumer();
    await probe().seedWithAttempts({ attempt: RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length });
    await expect(probe().waitForDepth({ target: QueueHelper.deadLetterQueue({ queue }), expected: 1 })).resolves.toBe(1);
    await consumer.onModuleDestroy();

    await expect(service.replayDeadLetters({ queue })).resolves.toBe(1);
    await expect(probe().waitForDepth({ target: queue, expected: 1 })).resolves.toBe(1);
    expect(await service.queueDepth({ queue: QueueHelper.deadLetterQueue({ queue }) })).toBe(0);
    await expect(service.replayDeadLetters({ queue })).resolves.toBe(0);
    expect(await service.queueDepth({ queue })).toBe(1);
  });

  it('reports every rung of a queue through the dlq CLI', async () => {
    const { queue, routingKey, service } = probe();
    const consumer = await RabbitProbe.start();
    await consumer.subscribe({ queue, routingKey, handler: () => Promise.resolve() });
    await consumer.onModuleDestroy();
    await service.publish({ payload: R.PAYLOAD, routingKey });
    await expect(probe().waitForDepth({ target: queue, expected: 1 })).resolves.toBe(1);

    const rows = probe()
      .runCli({ args: [R.DEPTH_COMMAND, queue] })
      .trim()
      .split(R.ROW_SEPARATOR)
      .map(row => row.split(R.COLUMN_SEPARATOR));

    expect(rows.map(([name]) => name)).toEqual([
      queue,
      ...RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.map((_, index) => QueueHelper.retryQueue({ queue, attempt: index + 1 })),
      QueueHelper.deadLetterQueue({ queue })
    ]);
    expect(rows[0]?.[1]).toBe(R.ONE_MESSAGE);
  });
});

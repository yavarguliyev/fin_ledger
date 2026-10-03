import { setTimeout as sleep } from 'node:timers/promises';

import { RABBIT_PROBE as R } from '../constants/rabbit-probe.constant';
import { RabbitProbe } from '../helpers/rabbit-probe.helper';

describe('RabbitMQ delivery across outages', () => {
  const probe = RabbitProbe.useInSuite();

  it('delivers messages that were published while the consumer was down', async () => {
    const { queue, routingKey, service } = probe();
    const first = await RabbitProbe.start();
    await first.subscribe({ queue, routingKey, handler: () => Promise.resolve() });
    await first.onModuleDestroy();
    await service.publish({ payload: R.PAYLOAD, routingKey });
    expect(await service.queueDepth({ queue })).toBe(1);

    const delivered: unknown[] = [];
    const restarted = await probe().recordingConsumer({ delivered });

    await expect(probe().waitForDepth({ target: queue, expected: 0 })).resolves.toBe(0);
    expect(delivered).toEqual([R.PAYLOAD]);
    await restarted.onModuleDestroy();
  });

  it('reconnects and restores its subscriptions after the broker drops the connection', async () => {
    const delivered: unknown[] = [];
    const consumer = await probe().recordingConsumer({ delivered });
    await RabbitProbe.closeAllBrokerConnections();
    await sleep(R.DELIVERY_POLL_MS);

    const publisher = await RabbitProbe.start();
    await publisher.publish({ payload: R.PAYLOAD, routingKey: probe().routingKey });
    await expect(RabbitProbe.waitForDelivery({ delivered })).resolves.toEqual([R.PAYLOAD]);
    await publisher.onModuleDestroy();
    await consumer.onModuleDestroy();
  });

  it('restores its subscriptions after the connection drops', async () => {
    const delivered: unknown[] = [];
    const consumer = await probe().recordingConsumer({ delivered });

    await RabbitProbe.dropConnection({ target: consumer });
    await expect(probe().waitUntilUsable({ target: consumer })).resolves.toBe(true);
    await probe().service.publish({ payload: R.PAYLOAD, routingKey: probe().routingKey });
    await expect(probe().waitForDepth({ target: probe().queue, expected: 0 })).resolves.toBe(0);

    expect(delivered).toEqual([R.PAYLOAD]);
    await consumer.onModuleDestroy();
  });
});

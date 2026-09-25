import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import type { ConfigService } from '@nestjs/config';
import amqp from 'amqplib';
import type { ChannelModel } from 'amqplib';
import { RabbitmqService, QueueHelper, RABBITMQ_TOPOLOGY, ClientIds, CryptoHelper } from '@common/libs';

import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const DLQ_CLI = path.join(REPO_ROOT, 'scripts/rabbitmq/dlq.mjs');
const DELIVERY_WAIT_MS = 10_000;
const DELIVERY_POLL_MS = 100;
const RECONNECT_WAIT_MS = 20_000;

describe('RabbitMQ retry and dead-letter topology', () => {
  let service: RabbitmqService;
  let queue: string;
  let routingKey: string;

  const url = (): string => process.env[TEST_ENV_KEYS.RABBITMQ_URL] as string;
  const configService = { get: (key: string) => (key === 'RABBITMQ_URL' ? url() : undefined) } as unknown as ConfigService;

  const startService = async (): Promise<RabbitmqService> => {
    const started = new RabbitmqService({ configService, clientId: ClientIds.DEFAULT });
    await started.onModuleInit();
    return started;
  };

  const waitForDepth = async ({ target, expected }: { target: string; expected: number }): Promise<number> => {
    const deadline = Date.now() + DELIVERY_WAIT_MS;
    let depth = -1;

    while (Date.now() < deadline) {
      depth = await service.queueDepth({ queue: target });
      if (depth === expected) return depth;

      await sleep(DELIVERY_POLL_MS);
    }

    return depth;
  };

  const seedWithAttempts = async ({ attempt }: { attempt: number }): Promise<void> => {
    const connection = await amqp.connect(url());
    const channel = await connection.createConfirmChannel();

    channel.sendToQueue(queue, Buffer.from(JSON.stringify({ probe: true })), {
      persistent: true,
      headers: { [RABBITMQ_TOPOLOGY.ATTEMPTS_HEADER]: attempt }
    });

    await channel.waitForConfirms();
    await channel.close();
    await connection.close();
  };

  const closeAllBrokerConnections = async (): Promise<void> => {
    const management = process.env[TEST_ENV_KEYS.RABBITMQ_MANAGEMENT_URL] as string;
    const auth = `Basic ${Buffer.from('guest:guest').toString('base64')}`;
    const response = await fetch(`${management}/api/connections`, { headers: { authorization: auth } });
    const connections = (await response.json()) as { name: string }[];

    for (const { name } of connections) {
      await fetch(`${management}/api/connections/${encodeURIComponent(name)}`, { method: 'DELETE', headers: { authorization: auth } });
    }
  };

  const waitForDelivery = async ({ delivered }: { delivered: unknown[] }): Promise<unknown[]> => {
    const deadline = Date.now() + RECONNECT_WAIT_MS;
    while (delivered.length === 0 && Date.now() < deadline) await sleep(DELIVERY_POLL_MS);
    return delivered;
  };

  const dropConnection = async ({ target }: { target: RabbitmqService }): Promise<void> => {
    const { connection } = target as unknown as { connection: ChannelModel };
    await connection.close();
  };

  const waitUntilUsable = async ({ target }: { target: RabbitmqService }): Promise<boolean> => {
    const deadline = Date.now() + DELIVERY_WAIT_MS;

    while (Date.now() < deadline) {
      try {
        await target.queueDepth({ queue });
        return true;
      } catch {
        await sleep(DELIVERY_POLL_MS);
      }
    }

    return false;
  };

  const runCli = (args: string[]): string =>
    execFileSync(process.execPath, [DLQ_CLI, ...args], { env: { ...process.env, RABBITMQ_URL: url() }, encoding: 'utf8' });

  beforeEach(async () => {
    const suffix = CryptoHelper.uuid();
    queue = `probe.${suffix}`;
    routingKey = `probe.${suffix}`;
    service = await startService();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('delivers messages that were published while the consumer was down', async () => {
    const consumer = await startService();
    await consumer.subscribe({ queue, routingKey, handler: () => Promise.resolve() });
    await consumer.onModuleDestroy();

    await service.publish({ payload: { probe: true }, routingKey });
    expect(await service.queueDepth({ queue })).toBe(1);

    const delivered: unknown[] = [];
    const restarted = await startService();

    await restarted.subscribe({
      queue,
      routingKey,
      handler: message => {
        delivered.push(message);
        return Promise.resolve();
      }
    });

    await expect(waitForDepth({ target: queue, expected: 0 })).resolves.toBe(0);
    expect(delivered).toEqual([{ probe: true }]);

    await restarted.onModuleDestroy();
  });

  it('moves a failing message onto the retry ladder instead of dropping it', async () => {
    const consumer = await startService();

    await consumer.subscribe({ queue, routingKey, handler: () => Promise.reject(new Error('handler always throws')) });
    await service.publish({ payload: { probe: true }, routingKey });
    await expect(waitForDepth({ target: QueueHelper.retryQueue({ queue, attempt: 1 }), expected: 1 })).resolves.toBe(1);

    expect(await service.queueDepth({ queue: QueueHelper.deadLetterQueue({ queue }) })).toBe(0);

    await consumer.onModuleDestroy();
  });

  it('replays a dead-lettered message back to its queue exactly once', async () => {
    const consumer = await startService();

    await consumer.subscribe({ queue, routingKey, handler: () => Promise.reject(new Error('handler always throws')) });
    await seedWithAttempts({ attempt: RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length });
    await expect(waitForDepth({ target: QueueHelper.deadLetterQueue({ queue }), expected: 1 })).resolves.toBe(1);
    await consumer.onModuleDestroy();

    const replayed = await service.replayDeadLetters({ queue });

    expect(replayed).toBe(1);
    expect(await service.queueDepth({ queue: QueueHelper.deadLetterQueue({ queue }) })).toBe(0);

    await expect(waitForDepth({ target: queue, expected: 1 })).resolves.toBe(1);
    await expect(service.replayDeadLetters({ queue })).resolves.toBe(0);
  });

  it('reconnects and restores its subscriptions after the broker drops the connection', async () => {
    const delivered: unknown[] = [];
    const consumer = await startService();

    await consumer.subscribe({
      queue,
      routingKey,
      handler: message => {
        delivered.push(message);
        return Promise.resolve();
      }
    });

    await closeAllBrokerConnections();
    await sleep(DELIVERY_POLL_MS);

    const publisher = await startService();

    await publisher.publish({ payload: { probe: true }, routingKey });
    await expect(waitForDelivery({ delivered })).resolves.toEqual([{ probe: true }]);
    await publisher.onModuleDestroy();
    await consumer.onModuleDestroy();
  });

  it('parks a message in the dead-letter queue once the ladder is exhausted', async () => {
    const consumer = await startService();

    await consumer.subscribe({ queue, routingKey, handler: () => Promise.reject(new Error('handler always throws')) });
    await seedWithAttempts({ attempt: RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length });
    await expect(waitForDepth({ target: QueueHelper.deadLetterQueue({ queue }), expected: 1 })).resolves.toBe(1);
    await consumer.onModuleDestroy();
  });

  it('uses a strictly growing delay for each rung of the retry ladder', () => {
    const delays = RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.map((_, index) => QueueHelper.retryDelay({ attempt: index + 1 }));
    expect(delays).toEqual([...delays].sort((first, second) => first - second));
    expect(new Set(delays).size).toBe(delays.length);
  });

  it('restores its subscriptions after the connection drops', async () => {
    const delivered: unknown[] = [];
    const consumer = await startService();

    await consumer.subscribe({
      queue,
      routingKey,
      handler: message => {
        delivered.push(message);
        return Promise.resolve();
      }
    });

    await dropConnection({ target: consumer });
    await expect(waitUntilUsable({ target: consumer })).resolves.toBe(true);
    await service.publish({ payload: { probe: true }, routingKey });
    await expect(waitForDepth({ target: queue, expected: 0 })).resolves.toBe(0);

    expect(delivered).toEqual([{ probe: true }]);

    await consumer.onModuleDestroy();
  });

  it('replays a dead-lettered message back to its queue exactly once', async () => {
    const consumer = await startService();

    await consumer.subscribe({ queue, routingKey, handler: () => Promise.reject(new Error('handler always throws')) });
    await seedWithAttempts({ attempt: RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length });
    await expect(waitForDepth({ target: QueueHelper.deadLetterQueue({ queue }), expected: 1 })).resolves.toBe(1);
    await consumer.onModuleDestroy();
    await expect(service.replayDeadLetters({ queue })).resolves.toBe(1);
    await expect(waitForDepth({ target: queue, expected: 1 })).resolves.toBe(1);

    expect(await service.queueDepth({ queue: QueueHelper.deadLetterQueue({ queue }) })).toBe(0);

    await expect(service.replayDeadLetters({ queue })).resolves.toBe(0);
    expect(await service.queueDepth({ queue })).toBe(1);
  });

  it('reports every rung of a queue through the dlq CLI', async () => {
    const consumer = await startService();

    await consumer.subscribe({ queue, routingKey, handler: () => Promise.resolve() });
    await consumer.onModuleDestroy();
    await service.publish({ payload: { probe: true }, routingKey });
    await expect(waitForDepth({ target: queue, expected: 1 })).resolves.toBe(1);

    const reported = runCli(['depth', queue]);
    const rows = reported
      .trim()
      .split('\n')
      .map(row => row.split('\t'));

    expect(rows.map(([name]) => name)).toEqual([
      queue,
      ...RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.map((_, index) => QueueHelper.retryQueue({ queue, attempt: index + 1 })),
      QueueHelper.deadLetterQueue({ queue })
    ]);

    expect(rows[0]?.[1]).toBe('1');
  });
});

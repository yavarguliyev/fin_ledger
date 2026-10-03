import { execFileSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import amqp from 'amqplib';
import { RabbitmqService, RABBITMQ_TOPOLOGY } from '@common/rabbitmq';
import { ClientIds, CryptoHelper } from '@common/shared-libs';

import { RABBIT_PROBE as R } from '../constants/rabbit-probe.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { DeliveryWait, DepthWait, SeedAttempts, ServiceRef } from '../interfaces/rabbit-probe.interface';
import { aConfigService } from '../fakes/config.fake';
import { connectionOf } from '../fakes/rabbit.fake';

export class RabbitProbe {
  readonly queue = `${R.PREFIX}${CryptoHelper.uuid()}`;
  readonly routingKey = this.queue;
  service!: RabbitmqService;

  static url (): string {
    return process.env[TEST_ENV_KEYS.RABBITMQ_URL] as string;
  }

  static async start (): Promise<RabbitmqService> {
    const configService = aConfigService({ values: { [R.URL_KEY]: RabbitProbe.url() } });
    const started = new RabbitmqService({ configService, clientId: ClientIds.DEFAULT });
    await started.onModuleInit();
    return started;
  }

  static useInSuite (): () => RabbitProbe {
    let probe = new RabbitProbe();
    beforeEach(async () => {
      probe = new RabbitProbe();
      probe.service = await RabbitProbe.start();
    });
    afterEach(async () => probe.service.onModuleDestroy());
    return () => probe;
  }

  async failingConsumer (): Promise<RabbitmqService> {
    const consumer = await RabbitProbe.start();
    await consumer.subscribe({ queue: this.queue, routingKey: this.routingKey, handler: () => Promise.reject(new Error(R.FAILURE)) });
    return consumer;
  }

  async recordingConsumer ({ delivered }: DeliveryWait): Promise<RabbitmqService> {
    const consumer = await RabbitProbe.start();
    await consumer.subscribe({
      queue: this.queue,
      routingKey: this.routingKey,
      handler: message => {
        delivered.push(message);
        return Promise.resolve();
      }
    });
    return consumer;
  }

  async waitForDepth ({ target, expected }: DepthWait): Promise<number> {
    const deadline = Date.now() + R.DELIVERY_WAIT_MS;
    let depth = -1;
    while (Date.now() < deadline) {
      depth = await this.service.queueDepth({ queue: target });
      if (depth === expected) return depth;
      await sleep(R.DELIVERY_POLL_MS);
    }
    return depth;
  }

  async seedWithAttempts ({ attempt }: SeedAttempts): Promise<void> {
    const connection = await amqp.connect(RabbitProbe.url());
    const channel = await connection.createConfirmChannel();
    channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(R.PAYLOAD)), {
      persistent: true,
      headers: { [RABBITMQ_TOPOLOGY.ATTEMPTS_HEADER]: attempt }
    });
    await channel.waitForConfirms();
    await channel.close();
    await connection.close();
  }

  async waitUntilUsable ({ target }: ServiceRef): Promise<boolean> {
    const deadline = Date.now() + R.DELIVERY_WAIT_MS;
    while (Date.now() < deadline) {
      try {
        await target.queueDepth({ queue: this.queue });
        return true;
      } catch {
        await sleep(R.DELIVERY_POLL_MS);
      }
    }
    return false;
  }

  runCli (args: string[]): string {
    return execFileSync(process.execPath, [R.DLQ_CLI, ...args], { env: { ...process.env, RABBITMQ_URL: RabbitProbe.url() }, encoding: R.ENCODING });
  }

  static async closeAllBrokerConnections (): Promise<void> {
    const management = process.env[TEST_ENV_KEYS.RABBITMQ_MANAGEMENT_URL] as string;
    const headers = { authorization: `Basic ${Buffer.from(R.MANAGEMENT_CREDENTIALS).toString('base64')}` };
    const response = await fetch(`${management}${R.CONNECTIONS_PATH}`, { headers });
    const connections = (await response.json()) as { name: string }[];
    for (const { name } of connections) {
      await fetch(`${management}${R.CONNECTIONS_PATH}/${encodeURIComponent(name)}`, { method: 'DELETE', headers });
    }
  }

  static async waitForDelivery ({ delivered }: DeliveryWait): Promise<unknown[]> {
    const deadline = Date.now() + R.RECONNECT_WAIT_MS;
    while (delivered.length === 0 && Date.now() < deadline) await sleep(R.DELIVERY_POLL_MS);
    return delivered;
  }

  static async dropConnection ({ target }: ServiceRef): Promise<void> {
    await connectionOf({ target }).close();
  }
}

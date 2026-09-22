import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { AddressInfo, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RabbitMQContainer } from '@testcontainers/rabbitmq';
import { RedisContainer } from '@testcontainers/redis';
import { CryptoHelper } from '@common/shared-libs';

import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { TEST_IMAGES } from '../constants/test-images.constant';
import { TEST_ORIGINS } from '../constants/test-origins.constant';
import { IntegrationStack } from '../interfaces/integration-stack.interface';
import { PortRef } from '../interfaces/port-ref.interface';
import { WaitForApi } from '../interfaces/wait-for-api.interface';

export class IntegrationStackHelper {
  private static readonly APP_DIR = path.resolve(__dirname, '../..');
  private static readonly REPO_ROOT = path.resolve(IntegrationStackHelper.APP_DIR, '../..');
  private static readonly JWT_ISSUER = 'core-api-integration';
  private static readonly READY_TIMEOUT_MS = 90_000;

  static async start (): Promise<IntegrationStack> {
    const [kafkaPort, apiPort] = await Promise.all([IntegrationStackHelper.freePort(), IntegrationStackHelper.freePort()]);
    const redisPassword = CryptoHelper.randomToken({ bytes: 12 });

    const [postgres, redis, rabbitmq, kafka] = await Promise.all([
      new PostgreSqlContainer(TEST_IMAGES.POSTGRES).withDatabase('core_api_test').start(),
      new RedisContainer(TEST_IMAGES.REDIS).withPassword(redisPassword).start(),
      new RabbitMQContainer(TEST_IMAGES.RABBITMQ).start(),
      IntegrationStackHelper.startKafka({ port: kafkaPort })
    ]);

    const databaseUrl = postgres.getConnectionUri();
    execFileSync(path.join(IntegrationStackHelper.REPO_ROOT, 'node_modules/.bin/node-pg-migrate'), ['up', '--migrations-dir', path.join(IntegrationStackHelper.APP_DIR, 'migrations')], {
      env: { ...process.env, DATABASE_URL: databaseUrl, SEED_PASSWORD },
      stdio: 'pipe'
    });

    const { publicKey, privateKey } = CryptoHelper.generateRsaKeyPair();

    const redisHost = redis.getHost();
    const redisPort = redis.getPort();
    const workDir = mkdtempSync(path.join(tmpdir(), 'core-api-integration-'));

    const env: NodeJS.ProcessEnv = {
      PATH: process.env['PATH'],
      NODE_ENV: 'development',
      PORT: String(apiPort),
      HOST: '127.0.0.1',
      FRONTEND_URL: TEST_ORIGINS.FRONTEND,
      ALLOWED_ORIGINS: TEST_ORIGINS.FRONTEND,
      EMAIL_FROM: 'no-reply@core-api.test',
      JWT_PRIVATE_KEY: privateKey,
      JWT_PUBLIC_KEY: publicKey,
      JWT_EXPIRES_IN: '15m',
      JWT_ISSUER: IntegrationStackHelper.JWT_ISSUER,
      JWT_AUDIENCE: IntegrationStackHelper.JWT_ISSUER,
      DB_HOST: postgres.getHost(),
      DB_PORT: String(postgres.getPort()),
      DB_USERNAME: postgres.getUsername(),
      DB_PASSWORD: postgres.getPassword(),
      DB_NAME: postgres.getDatabase(),
      DB_DATABASE: postgres.getDatabase(),
      DATABASE_URL: databaseUrl,
      REDIS_HOST: redisHost,
      REDIS_PORT: String(redisPort),
      REDIS_PASSWORD: redisPassword,
      RABBITMQ_URL: rabbitmq.getAmqpUrl(),
      RABBITMQ_DEFAULT_USER: 'guest',
      RABBITMQ_DEFAULT_PASS: 'guest',
      RABBITMQ_DEFAULT_HOST: rabbitmq.getHost(),
      KAFKA_BROKERS: `127.0.0.1:${kafkaPort}`,
      KAFKA_BROKER_HOST: '127.0.0.1',
      KAFKA_BROKER_PORT: String(kafkaPort),
      KAFKA_CONSUMER_GROUP_ID: 'core-api-integration',
      STORAGE_STRATEGY: 's3',
      STORAGE_ENDPOINT: 'http://127.0.0.1:1',
      STORAGE_ACCESS_KEY: 'integration',
      STORAGE_SECRET_KEY: 'integration',
      STORAGE_BUCKET_NAME: 'integration',
      STORAGE_REGION: 'us-east-1',
      STORAGE_FORCE_PATH_STYLE: 'true',
      STORAGE_ENSURE_BUCKET: 'false',
      PAYMENT_SIMULATION: 'true',
      TRUST_PROXY: '1',
      MFA_ENCRYPTION_KEY: CryptoHelper.randomBytes({ bytes: 32 }).toString('base64'),
      MFA_ISSUER: 'Integration Wallet'
    };

    const api = spawn(process.execPath, [path.join(IntegrationStackHelper.APP_DIR, 'dist/main.js')], { cwd: workDir, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const logs: string[] = [];
    api.stdout?.on('data', (chunk: Buffer) => logs.push(chunk.toString()));
    api.stderr?.on('data', (chunk: Buffer) => logs.push(chunk.toString()));

    const apiUrl = `http://127.0.0.1:${apiPort}/api/v1`;
    await IntegrationStackHelper.waitForApi({ url: apiUrl, api, logs });

    process.env[TEST_ENV_KEYS.API_URL] = apiUrl;
    process.env[TEST_ENV_KEYS.DATABASE_URL] = databaseUrl;
    process.env[TEST_ENV_KEYS.KAFKA_BROKERS] = `127.0.0.1:${kafkaPort}`;
    process.env[TEST_ENV_KEYS.REDIS_URL] = `redis://:${redisPassword}@${redisHost}:${redisPort}/0`;

    return { api, containers: [postgres, redis, rabbitmq, kafka], workDir };
  }

  static async stop ({ api, containers, workDir }: IntegrationStack): Promise<void> {
    if (api.exitCode === null) {
      api.kill('SIGTERM');
      await Promise.race([once(api, 'exit'), sleep(15_000)]);
    }

    await Promise.all(containers.map(container => container.stop()));
    rmSync(workDir, { recursive: true, force: true });
  }

  private static async startKafka ({ port }: PortRef): Promise<StartedTestContainer> {
    return new GenericContainer(TEST_IMAGES.KAFKA)
      .withEnvironment({
        KAFKA_NODE_ID: '1',
        KAFKA_PROCESS_ROLES: 'broker,controller',
        KAFKA_CONTROLLER_QUORUM_VOTERS: '1@localhost:9093',
        KAFKA_LISTENERS: `PLAINTEXT://0.0.0.0:${port},CONTROLLER://0.0.0.0:9093`,
        KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://127.0.0.1:${port}`,
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER',
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: '1',
        KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: '0'
      })
      .withExposedPorts({ container: port, host: port })
      .withWaitStrategy(Wait.forLogMessage(/Kafka Server started/))
      .start();
  }

  private static async waitForApi ({ url, api, logs }: WaitForApi): Promise<void> {
    const deadline = Date.now() + IntegrationStackHelper.READY_TIMEOUT_MS;

    while (Date.now() < deadline) {
      if (api.exitCode !== null) throw new Error(`core-api exited during startup:\n${logs.join('')}`);

      const ready = await fetch(`${url}/game-events`).then(
        () => true,
        () => false
      );
      if (ready) return;

      await sleep(500);
    }

    throw new Error(`core-api did not become ready in time:\n${logs.join('')}`);
  }

  private static async freePort (): Promise<number> {
    const server = createServer();
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const { port } = server.address() as AddressInfo;
    server.close();
    await once(server, 'close');

    return port;
  }
}

import { once } from 'node:events';
import { AddressInfo, createServer } from 'node:net';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RabbitMQContainer } from '@testcontainers/rabbitmq';
import { RedisContainer } from '@testcontainers/redis';

import { INTEGRATION_STACK as S } from '../constants/integration-stack.constant';
import { TEST_IMAGES } from '../constants/test-images.constant';
import { PortRef } from '../interfaces/port-ref.interface';
import { StackContainers } from '../interfaces/stack-containers.interface';
import { StackStart } from '../interfaces/stack-start.interface';

export class StackContainersHelper {
  static async startAll ({ kafkaPort, redisPassword }: StackStart): Promise<StackContainers> {
    const [postgres, redis, rabbitmq, kafka, minio] = await Promise.all([
      new PostgreSqlContainer(TEST_IMAGES.POSTGRES).withDatabase(S.DATABASE_NAME).start(),
      new RedisContainer(TEST_IMAGES.REDIS).withPassword(redisPassword).start(),
      new RabbitMQContainer(TEST_IMAGES.RABBITMQ).start(),
      StackContainersHelper.startKafka({ port: kafkaPort }),
      StackContainersHelper.startMinio()
    ]);

    return { postgres, redis, rabbitmq, kafka, minio };
  }

  static async freePort (): Promise<number> {
    const server = createServer();
    server.listen(0, S.LOOPBACK);
    await once(server, 'listening');

    const { port } = server.address() as AddressInfo;
    server.close();
    await once(server, 'close');

    return port;
  }

  private static async startMinio (): Promise<StartedTestContainer> {
    return new GenericContainer(TEST_IMAGES.MINIO)
      .withEnvironment({ MINIO_ROOT_USER: S.MINIO_USER, MINIO_ROOT_PASSWORD: S.MINIO_PASSWORD })
      .withCommand([...S.MINIO_COMMAND])
      .withExposedPorts(S.MINIO_PORT)
      .withWaitStrategy(Wait.forHttp(S.MINIO_HEALTH_PATH, S.MINIO_PORT))
      .start();
  }

  private static async startKafka ({ port }: PortRef): Promise<StartedTestContainer> {
    return new GenericContainer(TEST_IMAGES.KAFKA)
      .withEnvironment({
        KAFKA_NODE_ID: '1',
        KAFKA_PROCESS_ROLES: 'broker,controller',
        KAFKA_CONTROLLER_QUORUM_VOTERS: `1@localhost:${S.KAFKA_CONTROLLER_PORT}`,
        KAFKA_LISTENERS: `PLAINTEXT://0.0.0.0:${port},CONTROLLER://0.0.0.0:${S.KAFKA_CONTROLLER_PORT}`,
        KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://${S.LOOPBACK}:${port}`,
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER',
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: '1',
        KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: '0'
      })
      .withExposedPorts({ container: port, host: port })
      .withWaitStrategy(Wait.forLogMessage(S.KAFKA_READY_LOG))
      .start();
  }
}

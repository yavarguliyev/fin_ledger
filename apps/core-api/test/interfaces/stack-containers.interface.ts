import type { StartedTestContainer } from 'testcontainers';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRabbitMQContainer } from '@testcontainers/rabbitmq';
import type { StartedRedisContainer } from '@testcontainers/redis';

export interface StackContainers {
  postgres: StartedPostgreSqlContainer;
  redis: StartedRedisContainer;
  rabbitmq: StartedRabbitMQContainer;
  kafka: StartedTestContainer;
  minio: StartedTestContainer;
}

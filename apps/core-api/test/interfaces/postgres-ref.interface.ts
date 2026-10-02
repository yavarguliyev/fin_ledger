import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export interface PostgresRef {
  postgres: StartedPostgreSqlContainer;
}

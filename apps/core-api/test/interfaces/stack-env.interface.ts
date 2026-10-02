import type { StackContainers } from './stack-containers.interface';
import type { StackDatabase } from './stack-database.interface';

export interface StackEnv {
  containers: StackContainers;
  database: StackDatabase;
  kafkaPort: number;
  apiPort: number;
  redisPassword: string;
  emailLinkKey: string;
}

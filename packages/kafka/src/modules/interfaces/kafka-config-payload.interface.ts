import { logLevel } from 'kafkajs';

export interface KafkaConfigPayload {
  clientId: string;
  logLevel: logLevel;
  readonly connectionTimeout: number;
  readonly requestTimeout: number;
  readonly authenticationTimeout: number;
  readonly reauthenticationThreshold: number;
  readonly brokers: string[];
  readonly retry: {
    initialRetryTime: number;
    retries: number;
    maxRetryTime: number;
  };
}

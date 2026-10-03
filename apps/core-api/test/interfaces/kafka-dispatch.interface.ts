import type { Logger } from '@nestjs/common';
import type { InboxRepository } from '@common/database';
import type { KafkaSendDto } from '@common/kafka';

export interface ParkedMessage {
  topic: string;
  headers: Record<string, string>;
}

export interface DispatchPayloadSource {
  source: string;
  headers?: Record<string, string>;
}

export interface DispatchContext {
  send: (message: KafkaSendDto) => Promise<void>;
  consumerGroup: string;
  inboxRepository: InboxRepository;
  logger: Logger;
}

export interface DispatchRecord {
  topic: string;
  partition: number;
  value: Record<string, boolean>;
  key: string;
  timestamp: string;
}

export interface InboxRow {
  consumer: string;
  message_id: string;
  topic: string;
}

export interface QueryCall {
  sql: string;
  params?: unknown[];
}

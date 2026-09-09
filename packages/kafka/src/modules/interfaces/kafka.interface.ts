import { ConsumerConfig, KafkaConfig as KafkaJsConfig, ProducerConfig, logLevel } from 'kafkajs';

import { Topic } from '@common/shared-libs';

export interface KafkaMessageRecord<T = unknown> {
  readonly topic: string;
  readonly timestamp?: string;
  readonly partition?: number;
  readonly methodName?: string | symbol;
  readonly value: T;
  readonly key?: string | Buffer | null;
  readonly headers?: Record<string, string | Buffer | Array<string | Buffer>>;
}

export interface RegisterSingleSubscriberRecord {
  readonly methodName: string | symbol;
  readonly topic?: string;
  readonly partition?: number;
  readonly instance: object;
  readonly options: {
    readonly topic: Topic;
  };
}

export interface TopicMetadata {
  readonly topicMetadata: {
    readonly topics: Array<{
      readonly name: string;
    }>;
  };
}

export interface BaseKafkaMessageRecord {
  readonly key?: string | ((result: unknown, args: unknown[]) => string);
  readonly messagesInPerSec: number;
  readonly underReplicatedPartitions: number;
  readonly config: KafkaJsConfig;
  readonly producerConfig?: ProducerConfig;
  readonly consumerConfig?: ConsumerConfig;
  readonly topic: string | RegExp;
  readonly fromBeginning?: boolean;
  readonly options: { readonly topic: string | RegExp; readonly fromBeginning?: boolean };
  readonly admin: {
    readonly fetchTopicOffsets: (name: string) => Promise<Array<{ high?: string }>>;
  };
  readonly message: {
    readonly value: Buffer | null;
    readonly key: Buffer | null;
    readonly timestamp: string;
    readonly headers?: unknown;
  };
  readonly topicMetadata: {
    readonly topics: Array<{
      readonly partitions: Array<{
        readonly replicas: unknown[];
        readonly isr: unknown[];
      }>;
    }>;
  };
}
export interface KafkaPublishRecord {
  readonly topic: string;
  readonly key?: string;
  readonly partition?: number;
  readonly methodName?: string | symbol;
}

export interface KafkaMessage {
  readonly topic: string;
  readonly partition: number;
  readonly methodName?: string | symbol;
  readonly message: {
    readonly value: Buffer | null;
    readonly key: Buffer | null;
    readonly timestamp: string;
    readonly headers?: unknown;
  };
}

export interface KafkaSubscriberMetadataRecord {
  readonly methodName: string | symbol;
  readonly options: { readonly topic: string | RegExp; readonly fromBeginning?: boolean };
}

export interface KafkaPublishDecoratorRecord {
  readonly topic: string;
  readonly key?: string | ((result: unknown, args: unknown[]) => string);
}

export interface KafkaSubscribeDecoratorRecord {
  readonly topic: string | RegExp;
  readonly fromBeginning?: boolean;
}

export interface KafkaMetricsRecord {
  readonly messagesInPerSec: number;
  readonly underReplicatedPartitions: number;
}

export interface ReplicatedPartitionsRecord {
  readonly topicMetadata: {
    readonly topics: Array<{
      readonly partitions: Array<{
        readonly replicas: unknown[];
        readonly isr: unknown[];
      }>;
    }>;
  };
}

export interface CalculateTotalMessagesRecord extends TopicMetadata {
  readonly admin: {
    readonly fetchTopicOffsets: (name: string) => Promise<Array<{ high?: string }>>;
  };
}

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

export interface ConsumerConfigPayload {
  readonly groupId: string;
  readonly sessionTimeout: number;
  readonly heartbeatInterval: number;
  readonly maxWaitTimeInMs: number;
  readonly rebalanceTimeout: number;
}

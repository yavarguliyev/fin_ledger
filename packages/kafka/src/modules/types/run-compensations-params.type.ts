import { Consumer, Kafka } from 'kafkajs';
import { Logger } from '@nestjs/common';
import { WorkflowContext } from '@common/shared-libs';

import { WorkflowStep } from '../interfaces/workflow.interface';

export type ParseKafkaHeadersParams = Record<string, Buffer | string | (Buffer | string)[]>;

export type CreateKafkaConfigParams = { clientId: string; brokers: string[] };

export type EnsureKafkaTopicsExistParams = { kafka: Kafka; topics: string[]; logger: Logger };

export type InstanceWrapper = { instance?: unknown };

export type CreateConsumerConfigParams = { groupId: string };

export type SubscribeToTopicsParams = { consumer: Consumer; topics: string[] };

export type ResolveBrokersParams = {
  brokers?: string | undefined;
  host?: string | undefined;
  port?: number | undefined;
};

export type RunCompensationsParams<TContext extends WorkflowContext> = {
  steps: WorkflowStep<TContext>[];
  context: TContext;
  failedIndex: number;
  logger: Logger;
};

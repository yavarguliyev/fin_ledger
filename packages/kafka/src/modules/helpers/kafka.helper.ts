import { logLevel } from 'kafkajs';
import { BaseHelper, HeadersPayload, WorkflowContext, WorkflowExecutionRecord, WorkflowStepStatus } from '@common/shared-libs';

import { KafkaMessageRecord, KafkaMessage, KafkaConfigPayload, ConsumerConfigPayload } from '../interfaces/kafka.interface';
import {
  CreateConsumerConfigParams,
  CreateKafkaConfigParams,
  EnsureKafkaTopicsExistParams,
  InstanceWrapper,
  ParseKafkaHeadersParams,
  ResolveBrokersParams,
  RunCompensationsParams,
  SubscribeToTopicsParams
} from '../types/run-compensations-params.type';

export class KafkaHelper {
  public static isValidInstance (wrapper: InstanceWrapper): boolean {
    return Boolean(wrapper.instance) && typeof wrapper.instance === 'object';
  }

  public static createConsumerConfig ({ groupId }: CreateConsumerConfigParams): ConsumerConfigPayload {
    return { groupId, sessionTimeout: 30000, heartbeatInterval: 3000, maxWaitTimeInMs: 5000, rebalanceTimeout: 60000 };
  }

  public static async subscribeToTopics ({ consumer, topics }: SubscribeToTopicsParams): Promise<void> {
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }
  }

  public static resolveBrokers ({ brokers, host, port }: ResolveBrokersParams): string[] {
    if (brokers) return brokers.split(',').map(broker => broker.trim());
    if (!host || !port) return [];
    return [`${host}:${port}`];
  }

  public static buildKafkaMessage ({ topic, partition, message }: KafkaMessage): KafkaMessageRecord {
    const value: unknown = message.value ? JSON.parse(message.value.toString()) : null;
    const key = message.key ? message.key.toString() : null;

    if (message.headers) {
      const headers = this.parseKafkaHeaders(message.headers as ParseKafkaHeadersParams);
      return { topic, partition, value, key, timestamp: message.timestamp, headers };
    }

    return { topic, partition, value, key, timestamp: message.timestamp };
  }

  public static parseKafkaHeaders (headers: ParseKafkaHeadersParams): HeadersPayload {
    const parsed: Record<string, string | Buffer | (string | Buffer)[]> = {};
    const headersObj = headers as Record<string, Buffer | string | (Buffer | string)[]>;

    for (const [key, value] of Object.entries(headersObj)) {
      if (Buffer.isBuffer(value)) parsed[key] = value.toString();
      else if (Array.isArray(value)) parsed[key] = value.map(item => (Buffer.isBuffer(item) ? item.toString() : item));
      else parsed[key] = value;
    }

    return parsed;
  }

  public static async ensureKafkaTopicsExist ({ kafka, topics, logger }: EnsureKafkaTopicsExistParams): Promise<void> {
    const admin = kafka.admin();

    try {
      await admin.connect();

      const existingTopics = await admin.listTopics();
      const missingTopics = topics.filter(topic => !existingTopics.includes(topic));

      if (missingTopics.length > 0) {
        await admin.createTopics({ topics: missingTopics.map(topic => ({ topic, numPartitions: 1, replicationFactor: 1 })) });
        logger.log(`Auto-created missing Kafka topics: ${missingTopics.join(', ')}`);
      }
    } catch (error) {
      logger.warn(`Failed to auto-create missing Kafka topics: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      await admin.disconnect();
    }
  }

  public static createKafkaConfig ({ clientId, brokers }: CreateKafkaConfigParams): KafkaConfigPayload {
    return {
      clientId,
      brokers,
      logLevel: logLevel.NOTHING,
      connectionTimeout: 30000,
      requestTimeout: 30000,
      authenticationTimeout: 30000,
      reauthenticationThreshold: 30000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
        maxRetryTime: 30000
      }
    };
  }

  public static async runCompensations<TContext extends WorkflowContext> (
    params: RunCompensationsParams<TContext>
  ): Promise<WorkflowExecutionRecord[]> {
    const { steps, context, failedIndex, logger } = params;

    const log: WorkflowExecutionRecord[] = [];
    const executedSteps = steps.slice(0, failedIndex).reverse();

    for (const currentStep of executedSteps) {
      try {
        await currentStep.compensate(context);

        log.push({ stepName: currentStep.stepName, status: WorkflowStepStatus.COMPENSATED });
        logger.warn(`Compensated: ${currentStep.stepName}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        log.push({ stepName: currentStep.stepName, status: WorkflowStepStatus.FAILED });
        logger.error(`Compensation failed for ${currentStep.stepName}: ${message}`);
      }
    }

    return log;
  }
}

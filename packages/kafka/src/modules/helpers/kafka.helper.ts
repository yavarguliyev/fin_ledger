import { logLevel } from 'kafkajs';
import { BaseHelper, HeadersPayload, WorkflowExecutionRecord, WorkflowStepStatus } from '@common/shared-libs';

import { KafkaMessageRecord } from '../interfaces/kafka-message-record.interface';
import { KafkaConfigPayload } from '../interfaces/kafka-config-payload.interface';
import { ConsumerConfigPayload } from '../interfaces/consumer-config-payload.interface';
import { BuildKafkaMessageDto } from '../dtos/helper/build-kafka-message.dto';
import { CreateConsumerConfigDto } from '../dtos/helper/create-consumer-config.dto';
import { CreateKafkaConfigDto } from '../dtos/helper/create-kafka-config.dto';
import { EnsureKafkaTopicsDto } from '../dtos/helper/ensure-kafka-topics.dto';
import { InstanceWrapperDto } from '../dtos/helper/instance-wrapper.dto';
import { ParseKafkaHeadersDto } from '../dtos/helper/parse-kafka-headers.dto';
import { ResolveBrokersDto } from '../dtos/helper/resolve-brokers.dto';
import { RunCompensationsDto } from '../dtos/helper/run-compensations.dto';
import { SubscribeToTopicsDto } from '../dtos/helper/subscribe-to-topics.dto';

export class KafkaHelper {
  static isValidInstance (wrapper: InstanceWrapperDto): boolean {
    return Boolean(wrapper.instance) && typeof wrapper.instance === 'object';
  }

  static createConsumerConfig ({ groupId }: CreateConsumerConfigDto): ConsumerConfigPayload {
    return { groupId, sessionTimeout: 30000, heartbeatInterval: 3000, maxWaitTimeInMs: 5000, rebalanceTimeout: 60000 };
  }

  static async subscribeToTopics ({ consumer, topics }: SubscribeToTopicsDto): Promise<void> {
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }
  }

  static resolveBrokers ({ brokers, host, port }: ResolveBrokersDto): string[] {
    if (brokers) return brokers.split(',').map(broker => broker.trim());
    if (!host || !port) return [];
    return [`${host}:${port}`];
  }

  static buildKafkaMessage ({ topic, partition, message }: BuildKafkaMessageDto): KafkaMessageRecord {
    const value: unknown = message.value ? JSON.parse(message.value.toString()) : null;
    const key = message.key ? message.key.toString() : null;

    if (message.headers) {
      const headers = KafkaHelper.parseKafkaHeaders({ headers: message.headers });
      return { topic, partition, value, key, timestamp: message.timestamp, headers };
    }

    return { topic, partition, value, key, timestamp: message.timestamp };
  }

  static parseKafkaHeaders ({ headers }: ParseKafkaHeadersDto): HeadersPayload {
    const parsed: Record<string, string | Buffer | (string | Buffer)[]> = {};
    const headersObj = headers as Record<string, Buffer | string | (Buffer | string)[]>;

    for (const [key, value] of Object.entries(headersObj)) {
      if (Buffer.isBuffer(value)) parsed[key] = value.toString();
      else if (Array.isArray(value)) parsed[key] = value.map(item => (Buffer.isBuffer(item) ? item.toString() : item));
      else parsed[key] = value;
    }

    return parsed;
  }

  static async ensureKafkaTopicsExist ({ kafka, topics, logger }: EnsureKafkaTopicsDto): Promise<void> {
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

  static createKafkaConfig ({ clientId, brokers }: CreateKafkaConfigDto): KafkaConfigPayload {
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

  static async runCompensations (params: RunCompensationsDto): Promise<WorkflowExecutionRecord[]> {
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

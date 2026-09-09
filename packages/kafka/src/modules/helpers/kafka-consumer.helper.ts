import { Logger } from '@nestjs/common';
import { Kafka, Consumer, logLevel } from 'kafkajs';
import { errorResponse, HeadersPayload } from '@common/shared-libs';

import { KafkaMessageRecord, KafkaMessage, KafkaConfigPayload, ConsumerConfigPayload } from '../interfaces/kafka.interface';

export const resolveBrokers = (brokers?: string, host?: string, port?: number): string[] => {
  if (brokers) return brokers.split(',').map(broker => broker.trim());
  if (!host || !port) return [];
  return [`${host}:${port}`];
};

export const parseKafkaHeaders = (headers: unknown): HeadersPayload => {
  const parsed: Record<string, string | Buffer | (string | Buffer)[]> = {};
  const headersObj = headers as Record<string, Buffer | string | (Buffer | string)[]>;

  for (const [key, value] of Object.entries(headersObj)) {
    if (Buffer.isBuffer(value)) parsed[key] = value.toString();
    else if (Array.isArray(value)) parsed[key] = value.map(v => (Buffer.isBuffer(v) ? v.toString() : v));
    else parsed[key] = value;
  }

  return parsed;
};

export const isValidInstance = (wrapper: { instance?: unknown }): boolean => {
  return Boolean(wrapper.instance) && typeof wrapper.instance === 'object';
};

export const ensureKafkaTopicsExist = async (kafka: Kafka, topics: string[], logger: Logger): Promise<void> => {
  const admin = kafka.admin();

  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();
    const missingTopics = topics.filter(topic => !existingTopics.includes(topic));

    if (missingTopics.length > 0) {
      await admin.createTopics({
        topics: missingTopics.map(topic => ({ topic, numPartitions: 1, replicationFactor: 1 }))
      });

      logger.log(`Auto-created missing Kafka topics: ${missingTopics.join(', ')}`);
    }
  } catch (error) {
    logger.warn(`Failed to auto-create missing Kafka topics: ${errorResponse(error).message}`);
  } finally {
    await admin.disconnect();
  }
};

export const buildKafkaMessage = ({ topic, partition, message }: KafkaMessage): KafkaMessageRecord => {
  const value: unknown = message.value ? JSON.parse(message.value.toString()) : null;
  const key = message.key ? message.key.toString() : null;

  if (message.headers) {
    return { topic, partition, value, key, timestamp: message.timestamp, headers: parseKafkaHeaders(message.headers) };
  }

  return { topic, partition, value, key, timestamp: message.timestamp };
};

export const createKafkaConfig = (clientId: string, brokers: string[]): KafkaConfigPayload => {
  return {
    clientId,
    brokers,
    logLevel: logLevel.ERROR,
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
};

export const createConsumerConfig = (groupId: string): ConsumerConfigPayload => {
  return {
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    maxWaitTimeInMs: 5000,
    rebalanceTimeout: 60000
  };
};

export const subscribeToTopics = async (consumer: Consumer, topics: string[]): Promise<void> => {
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }
};

import { Logger } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { KafkaSendDto } from '@common/kafka';
import { InboxRepository } from '@common/database';
import { CryptoHelper } from '@common/shared-libs';

import { DbHelper } from './db.helper';
import { KAFKA_DISPATCH_TEST as K } from '../constants/kafka-dispatch.constant';
import { DispatchContext, DispatchPayloadSource, DispatchRecord, ParkedMessage, QueryCall } from '../interfaces/kafka-dispatch.interface';
import { aKafkaMessage } from '../fakes/kafka.fake';

export class KafkaDispatchProbe {
  readonly parked: ParkedMessage[] = [];
  topic = '';
  private inboxRepository!: InboxRepository;
  private readonly logger = new Logger(K.LOGGER);

  static useInSuite (): () => KafkaDispatchProbe {
    const probe = new KafkaDispatchProbe();
    beforeAll(() => {
      const connection = {
        query: async ({ sql, params }: QueryCall): Promise<{ rows: unknown[] }> => ({
          rows: await DbHelper.query({ sql, ...(params && { params }) })
        })
      };
      probe.inboxRepository = new InboxRepository({ getConnection: () => connection } as never);
    });
    beforeEach(() => {
      probe.topic = `${K.PREFIX}${CryptoHelper.uuid()}`;
      probe.parked.length = 0;
    });
    afterAll(async () => {
      await DbHelper.query({ sql: K.CLEANUP_SQL });
      await DbHelper.close();
    });
    return () => probe;
  }

  record (): DispatchRecord {
    return { topic: this.topic, partition: K.PARTITION, value: K.PAYLOAD, key: K.KEY, timestamp: String(Date.now()) };
  }

  context (): DispatchContext {
    const send = async ({ topic, headers }: KafkaSendDto): Promise<void> => {
      this.parked.push({ topic, headers: Object.fromEntries(Object.entries(headers ?? {}).map(([key, value]) => [key, String(value)])) });
      await Promise.resolve();
    };
    return { send, consumerGroup: K.CONSUMER_GROUP, inboxRepository: this.inboxRepository, logger: this.logger };
  }

  static payloadFor ({ source, headers }: DispatchPayloadSource): EachMessagePayload {
    return {
      topic: source,
      partition: K.PARTITION,
      message: aKafkaMessage({
        key: Buffer.from(K.KEY),
        value: Buffer.from(JSON.stringify(K.PAYLOAD)),
        timestamp: String(Date.now()),
        offset: K.OFFSET,
        headers: Object.fromEntries(Object.entries(headers ?? {}).map(([key, value]) => [key, Buffer.from(value)]))
      }),
      heartbeat: () => Promise.resolve(),
      pause: () => () => undefined
    };
  }
}

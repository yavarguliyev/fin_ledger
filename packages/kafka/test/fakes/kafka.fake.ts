import type { InboxRepository } from '@common/database';
import type { EachMessagePayload } from 'kafkajs';

import { EachMessagePayloadFakeDto } from '../interfaces/fakes.interface';

type InboxEntry = Parameters<InboxRepository['wasProcessed']>[0];

export const aMemoryInbox = (): InboxRepository => {
  const processed = new Set<string>();

  return {
    wasProcessed: ({ consumer, messageId }: InboxEntry) => Promise.resolve(processed.has(`${consumer}|${messageId}`)),
    markProcessed: ({ consumer, messageId }: InboxEntry) => {
      processed.add(`${consumer}|${messageId}`);
      return Promise.resolve();
    }
  } as unknown as InboxRepository;
};

export const anEachMessagePayload = ({ topic, partition, offset }: EachMessagePayloadFakeDto): EachMessagePayload =>
  ({ topic, partition, message: { offset, headers: {}, value: null, key: null } }) as unknown as EachMessagePayload;

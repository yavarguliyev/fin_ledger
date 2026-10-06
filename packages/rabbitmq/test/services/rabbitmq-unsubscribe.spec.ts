import amqp from 'amqplib';
import { ClientIds } from '@common/shared-libs';

import { RabbitmqService } from '../../src/modules/services/rabbitmq.service';
import { RABBITMQ_UNSUBSCRIBE_TEST as T } from '../constants/rabbitmq-unsubscribe.constant';
import { aConfigService } from '../fakes/config.fake';

jest.mock('amqplib');

const cancel = jest.fn().mockResolvedValue(undefined);
const consume = jest.fn().mockResolvedValueOnce({ consumerTag: T.FIRST_TAG }).mockResolvedValueOnce({ consumerTag: T.SECOND_TAG });

const buildService = async (): Promise<RabbitmqService> => {
  const channel = {
    assertExchange: jest.fn().mockResolvedValue(undefined),
    assertQueue: jest.fn().mockResolvedValue(undefined),
    bindQueue: jest.fn().mockResolvedValue(undefined),
    prefetch: jest.fn().mockResolvedValue(undefined),
    consume,
    cancel
  };
  const connection = { createConfirmChannel: jest.fn().mockResolvedValue(channel), on: jest.fn(), close: jest.fn().mockResolvedValue(undefined) };
  (amqp.connect as jest.Mock).mockResolvedValue(connection);

  const service = new RabbitmqService({ configService: aConfigService({ values: { RABBITMQ_URL: T.URL } }), clientId: ClientIds.DEFAULT });
  await service.onModuleInit();
  return service;
};

describe('RabbitmqService.unsubscribe', () => {
  it('cancels only the consumer of the given queue, and ignores a queue it never consumed', async () => {
    const service = await buildService();
    const handler = jest.fn();

    await service.subscribe({ queue: T.FIRST_QUEUE, routingKey: T.FIRST_QUEUE, handler });
    await service.subscribe({ queue: T.SECOND_QUEUE, routingKey: T.SECOND_QUEUE, handler });
    await service.unsubscribe({ queue: T.FIRST_QUEUE });
    await service.unsubscribe({ queue: T.UNKNOWN_QUEUE });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith(T.FIRST_TAG);
  });
});

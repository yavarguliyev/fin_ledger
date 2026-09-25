import type { ConfigService } from '@nestjs/config';
import amqp from 'amqplib';
import { ClientIds } from '@common/shared-libs';

import { RabbitmqService } from '../src/modules/services/rabbitmq.service';
import { RABBITMQ_CONSTANTS } from '../src/modules/constants/messaging/rabbitmq.constant';

jest.mock('amqplib');

type ConfirmCallback = (error?: Error) => void;
type PublishMock = jest.Mock<boolean, [string, string, Buffer, Record<string, unknown>, ConfirmCallback]>;

const ROUTING_KEY = 'wallet.credited';
const PAYLOAD = { walletId: 'wallet-1' };

const buildService = async ({ publish }: { publish: PublishMock }): Promise<RabbitmqService> => {
  const channel = {
    assertExchange: jest.fn().mockResolvedValue(undefined),
    prefetch: jest.fn().mockResolvedValue(undefined),
    publish,
    close: jest.fn().mockResolvedValue(undefined)
  };

  const connection = { createConfirmChannel: jest.fn().mockResolvedValue(channel), on: jest.fn(), close: jest.fn().mockResolvedValue(undefined) };

  (amqp.connect as jest.Mock).mockResolvedValue(connection);

  const configService = { get: (key: string) => (key === 'RABBITMQ_URL' ? 'amqp://test' : undefined) } as unknown as ConfigService;
  const service = new RabbitmqService({ configService, clientId: ClientIds.DEFAULT });

  await service.onModuleInit();
  return service;
};

const capturingPublish = (): { publish: PublishMock; confirm: () => ConfirmCallback } => {
  let captured: ConfirmCallback = () => undefined;

  const publish = jest.fn((_exchange, _routingKey, _content, _options, callback: ConfirmCallback) => {
    captured = callback;
    return true;
  }) as unknown as PublishMock;

  return { publish, confirm: () => captured };
};

const rejectingPublish = (error: Error): PublishMock =>
  jest.fn((_exchange, _routingKey, _content, _options, callback: ConfirmCallback) => {
    callback(error);
    return true;
  });

describe('RabbitmqService.publish', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('resolves only once the broker confirms the message', async () => {
    const { publish, confirm } = capturingPublish();
    const service = await buildService({ publish });
    const settled = jest.fn();
    const published = service.publish({ payload: PAYLOAD, routingKey: ROUTING_KEY }).then(settled);

    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    confirm()();
    await published;

    expect(settled).toHaveBeenCalled();
    expect(publish).toHaveBeenCalledWith(
      RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(PAYLOAD)),
      { persistent: true },
      expect.any(Function)
    );
  });

  it('rejects when the broker refuses the message', async () => {
    const service = await buildService({ publish: rejectingPublish(new Error('resources exhausted')) });
    await expect(service.publish({ payload: PAYLOAD, routingKey: ROUTING_KEY })).rejects.toThrow('resources exhausted');
  });

  it('rejects when the broker never confirms', async () => {
    jest.useFakeTimers();

    const publish = jest.fn(() => true) as unknown as PublishMock;
    const service = await buildService({ publish });
    const published = service.publish({ payload: PAYLOAD, routingKey: ROUTING_KEY });
    const assertion = expect(published).rejects.toThrow(`did not confirm ${ROUTING_KEY}`);

    jest.advanceTimersByTime(RABBITMQ_CONSTANTS.PUBLISH_CONFIRM_TIMEOUT_MS.key);

    await assertion;
  });
});

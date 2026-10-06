import { MessageBroker } from '@common/messaging';
import { RabbitmqService } from '@common/rabbitmq';
import { QueueTransportKind, ServiceClientDto } from '@common/shared-libs';
import { SqsBrokerService } from '@common/sqs';

export class MessageBrokerHelper {
  static create ({ configService, clientId }: ServiceClientDto): MessageBroker {
    const kind = configService.get<QueueTransportKind>('QUEUE_TRANSPORT') ?? QueueTransportKind.RABBITMQ;
    const options = { configService, ...(clientId && { clientId }) };

    return kind === QueueTransportKind.SQS ? new SqsBrokerService(options) : new RabbitmqService(options);
  }
}

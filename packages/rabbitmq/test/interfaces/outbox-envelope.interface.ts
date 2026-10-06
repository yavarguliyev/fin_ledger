import { KafkaSendDto } from '@common/kafka';

import { RabbitmqPublishDto } from '../../src/modules/dtos/service/rabbitmq-publish.dto';
import { OutboxPublisherService } from '../../src/modules/services/outbox-publisher.service';

export interface EnvelopeRelayFixture {
  service: OutboxPublisherService;
  kafka: { send: jest.Mock<Promise<void>, [KafkaSendDto]> };
  rabbit: { publish: jest.Mock<Promise<void>, [RabbitmqPublishDto]> };
}

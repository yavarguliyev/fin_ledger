import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService, HealthIndicatorResult } from '@nestjs/terminus';
import { BaseHelper, MESSAGE_BROKER, MessageBroker } from '@common/libs';

import { HEALTH } from '../constants/health.constant';
import { NOTIFICATION_QUEUE } from '../../notification';

@Injectable()
export class BrokerHealthIndicator {
  constructor (
    @Inject(MESSAGE_BROKER) private readonly broker: MessageBroker,
    private readonly indicator: HealthIndicatorService
  ) {}

  async isHealthy (): Promise<HealthIndicatorResult> {
    const check = this.indicator.check(HEALTH.BROKER_KEY);

    try {
      const depth = await this.broker.queueDepth({ queue: `${NOTIFICATION_QUEUE.PREFIX}.${HEALTH.BROKER_PROBE_EVENT}` });
      return check.up({ notificationsPending: depth });
    } catch (error) {
      return check.down({ message: BaseHelper.errorResponse({ error }).message });
    }
  }
}

import type { RabbitmqService } from '@common/rabbitmq';

export interface DepthWait {
  target: string;
  expected: number;
}

export interface SeedAttempts {
  attempt: number;
}

export interface DeliveryWait {
  delivered: unknown[];
}

export interface ServiceRef {
  target: RabbitmqService;
}

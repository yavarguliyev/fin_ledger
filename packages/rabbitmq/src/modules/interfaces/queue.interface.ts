import { UnknownRecord } from '@common/shared-libs';

export interface RoutingKeyKeyBase {
  readonly routingKey: string;
}

export interface PayloadKeyBase {
  readonly payload: UnknownRecord;
}

export interface RabbitmqPublishOptions extends RoutingKeyKeyBase {
  readonly exchange?: string;
  readonly persistent?: boolean;
}

export interface RabbitmqPublishOptions extends RoutingKeyKeyBase {
  readonly exchange?: string;
  readonly persistent?: boolean;
}

export interface RabbitmqMessageHandler extends RoutingKeyKeyBase {
  handle(payload: PayloadKeyBase['payload']): Promise<void>;
}

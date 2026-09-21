export interface ConsumerConfigPayload {
  readonly groupId: string;
  readonly sessionTimeout: number;
  readonly heartbeatInterval: number;
  readonly maxWaitTimeInMs: number;
  readonly rebalanceTimeout: number;
}

export interface RequestScopeStore {
  correlationId: string;
  actorId?: string;
  system?: boolean;
  clientIp?: string;
  deviceId?: string;
  userAgent?: string;
}

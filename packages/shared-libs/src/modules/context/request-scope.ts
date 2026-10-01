import { AsyncLocalStorage } from 'node:async_hooks';

import { RequestScopeStore } from '../interfaces/request-scope-store.interface';
import { CryptoHelper } from '../helpers/crypto.helper';

export class RequestScope {
  private static readonly storage = new AsyncLocalStorage<RequestScopeStore>();

  static current = (): RequestScopeStore | undefined => RequestScope.storage.getStore();
  static correlationId = (): string | undefined => RequestScope.storage.getStore()?.correlationId;
  static isSystem = (): boolean => RequestScope.storage.getStore()?.system === true;
  static clientIp = (): string | undefined => RequestScope.storage.getStore()?.clientIp;
  static deviceId = (): string | undefined => RequestScope.storage.getStore()?.deviceId;
  static userAgent = (): string | undefined => RequestScope.storage.getStore()?.userAgent;
  static actorId = (): string | undefined => RequestScope.storage.getStore()?.actorId;

  static run<T> (store: RequestScopeStore, callback: () => T): T {
    return RequestScope.storage.run(store, callback);
  }

  static runSystem<T> (callback: () => T): T {
    const correlationId = RequestScope.correlationId() ?? CryptoHelper.uuid();
    return RequestScope.storage.run({ correlationId, system: true }, callback);
  }
}

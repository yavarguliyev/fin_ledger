import { AsyncLocalStorage } from 'node:async_hooks';

import { RequestScopeStore } from '../interfaces/request-scope-store.interface';
import { CryptoHelper } from '../helpers/crypto.helper';

export class RequestScope {
  private static readonly storage = new AsyncLocalStorage<RequestScopeStore>();

  static run<T> (store: RequestScopeStore, callback: () => T): T {
    return RequestScope.storage.run(store, callback);
  }

  static current (): RequestScopeStore | undefined {
    return RequestScope.storage.getStore();
  }

  static correlationId (): string | undefined {
    return RequestScope.storage.getStore()?.correlationId;
  }

  static runSystem<T> (callback: () => T): T {
    const correlationId = RequestScope.correlationId() ?? CryptoHelper.uuid();

    return RequestScope.storage.run({ correlationId, system: true }, callback);
  }

  static isSystem (): boolean {
    return RequestScope.storage.getStore()?.system === true;
  }

  static actorId (): string | undefined {
    return RequestScope.storage.getStore()?.actorId;
  }
}

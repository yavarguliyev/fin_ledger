import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { HttpRequestError } from '../../src/app/core/errors/http-request.error';
import { OfflineQueueHelper } from '../../src/app/core/helpers/support/offline-queue.helper';
import { QueueMessageDto } from '../../src/app/core/interfaces/support/queue-message.interface';
import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportOfflineQueueStore } from '../../src/app/core/services/support-offline-queue.store';
import { ToastService } from '../../src/app/core/services/toast.service';
import { OFFLINE_QUEUE_TEST as T } from '../constants/offline-queue.constant';

const failure = (status: number): Observable<never> => throwError(() => new HttpRequestError({ message: T.MESSAGE, status }));

const sendMessage = jest.fn<Observable<unknown>, [QueueMessageDto]>();
const upsertMessage = jest.fn();
const toastError = jest.fn();

const create = (): SupportOfflineQueueStore => {
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { sendMessage } },
      { provide: SupportChatStore, useValue: { upsertMessage } },
      { provide: ToastService, useValue: { error: toastError } }
    ]
  });
  return runInInjectionContext(injector, () => new SupportOfflineQueueStore());
};

describe('SupportOfflineQueueStore', () => {
  beforeEach(() => [sendMessage, upsertMessage, toastError].forEach(mock => mock.mockReset()));

  it('sends queued messages in the order they were written once back online', () => {
    sendMessage.mockImplementation(({ body }) => of({ body }));
    const store = create();
    store.queue({ conversationId: T.CONVERSATION, body: T.FIRST });
    store.queue({ conversationId: T.CONVERSATION, body: T.SECOND });

    store.flush();

    expect(sendMessage.mock.calls.map(([dto]) => dto.body)).toEqual([T.FIRST, T.SECOND]);
    expect(store.pending()).toEqual([]);
  });

  it('keeps every message while the network is still down', () => {
    sendMessage.mockReturnValue(failure(T.NETWORK_STATUS));
    const store = create();
    store.queue({ conversationId: T.CONVERSATION, body: T.FIRST });

    store.flush();

    expect(store.pending().map(item => item.body)).toEqual([T.FIRST]);
    expect(toastError).not.toHaveBeenCalled();
  });

  it('drops a message the server refuses and tells the user', () => {
    sendMessage.mockReturnValue(failure(T.REJECTED_STATUS));
    const store = create();
    store.queue({ conversationId: T.CONVERSATION, body: T.FIRST });

    store.flush();

    expect(store.pending()).toEqual([]);
    expect(toastError).toHaveBeenCalledTimes(1);
  });
});

describe('OfflineQueueHelper', () => {
  it('shows only the open conversation’s waiting messages', () => {
    const pending = [
      { localId: T.FIRST, conversationId: T.CONVERSATION, body: T.FIRST },
      { localId: T.SECOND, conversationId: T.OTHER_CONVERSATION, body: T.SECOND }
    ];

    expect(OfflineQueueHelper.pendingFor({ pending, conversationId: T.CONVERSATION }).map(item => item.body)).toEqual([T.FIRST]);
    expect(OfflineQueueHelper.pendingFor({ pending, conversationId: null })).toEqual([]);
  });
});

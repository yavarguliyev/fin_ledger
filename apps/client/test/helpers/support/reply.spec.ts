import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SendSupportMessageDto } from '../../../src/app/core/interfaces/support/send-support-message.interface';
import { SupportApiService } from '../../../src/app/core/services/support-api.service';
import { SupportChatHelper } from '../../../src/app/core/helpers/support/support-chat.helper';
import { SupportChatStore } from '../../../src/app/core/services/support-chat.store';
import { SupportComposeStore } from '../../../src/app/core/services/support-compose.store';
import { SupportMessage } from '../../../src/app/core/types/support/support-message.type';
import { SupportOfflineQueueStore } from '../../../src/app/core/services/support-offline-queue.store';
import { ToastService } from '../../../src/app/core/services/toast.service';
import { SUPPORT_REPLY_TEST as T } from '../../constants/support-reply.constant';

const message = (fields: Partial<SupportMessage>): SupportMessage => ({ id: T.ORIGINAL_ID, body: T.BODY, ...fields }) as SupportMessage;
const sendMessage = jest.fn<Observable<SupportMessage>, [SendSupportMessageDto]>(() => of(message({})));

const create = (): SupportComposeStore => {
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { sendMessage } },
      { provide: SupportChatStore, useValue: { upsertMessage: jest.fn() } },
      { provide: ToastService, useValue: { error: jest.fn() } },
      { provide: SupportOfflineQueueStore, useValue: { queue: jest.fn() } }
    ]
  });
  return runInInjectionContext(injector, () => new SupportComposeStore());
};

describe('Replying to a message', () => {
  beforeEach(() => {
    sendMessage.mockClear();
    (globalThis as unknown as { navigator: unknown }).navigator = { onLine: true };
  });

  it('sends the reply with the quoted message and then forgets it', () => {
    const store = create();
    store.startReply({ message: message({}) });
    store.send({ conversationId: T.CONVERSATION, body: T.BODY, files: [] });

    expect(sendMessage).toHaveBeenCalledWith({ conversationId: T.CONVERSATION, body: T.BODY, replyToMessageId: T.ORIGINAL_ID });
    expect(store.replying()).toBeNull();
  });

  it('keeps the quote when an edit of the reply arrives without one', () => {
    const quote = { id: T.ORIGINAL_ID, senderUserId: null, senderName: null, body: T.QUOTED, kind: 'TEXT', deleted: false } as SupportMessage['replyTo'];
    const current = [message({ replyTo: quote })];
    const [merged] = SupportChatHelper.upsertMessage({ current, incoming: message({ body: T.EDITED }) });

    expect(merged?.body).toBe(T.EDITED);
    expect(merged?.replyTo).toEqual(quote);
  });
});

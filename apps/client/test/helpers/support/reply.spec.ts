import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SendSupportMessageDto } from '../../../src/app/core/interfaces/support/send-support-message.interface';
import { SupportApiService } from '../../../src/app/core/services/support-api.service';
import { SupportChatHelper } from '../../../src/app/core/helpers/support/support-chat.helper';
import { SupportChatStore } from '../../../src/app/core/services/support-chat.store';
import { SupportComposeStore } from '../../../src/app/core/services/support-compose.store';
import { SupportMessage } from '../../../src/app/core/types/support/support-message.type';
import { SupportOfflineQueueStore } from '../../../src/app/core/services/support-offline-queue.store';
import { SupportUploadStore } from '../../../src/app/core/services/support-upload.store';
import { ToastService } from '../../../src/app/core/services/toast.service';
import { SUPPORT_REPLY_TEST as T } from '../../constants/support-reply.constant';
import { aSupportMessage } from '../../fakes/support.fake';
import { stubGlobal } from '../../fakes/global.fake';

const message = (fields: Partial<SupportMessage>): SupportMessage => aSupportMessage({ id: T.ORIGINAL_ID, body: T.BODY, ...fields });
const sendMessage = jest.fn<Observable<SupportMessage>, [SendSupportMessageDto]>(() => of(message({})));

const create = (): SupportComposeStore => {
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { sendMessage } },
      { provide: SupportChatStore, useValue: { upsertMessage: jest.fn() } },
      { provide: ToastService, useValue: { error: jest.fn() } },
      { provide: SupportOfflineQueueStore, useValue: { queue: jest.fn() } },
      { provide: SupportUploadStore, useValue: { start: jest.fn() } }
    ]
  });
  return runInInjectionContext(injector, () => new SupportComposeStore());
};

describe('Replying to a message', () => {
  beforeEach(() => {
    sendMessage.mockClear();
    stubGlobal({ name: 'navigator', value: { onLine: true } });
  });

  it('sends the reply with the quoted message and then forgets it', () => {
    const store = create();
    store.startReply({ message: message({}) });
    store.send({ conversationId: T.CONVERSATION, body: T.BODY, files: [] });

    expect(sendMessage).toHaveBeenCalledWith({ conversationId: T.CONVERSATION, body: T.BODY, replyToMessageId: T.ORIGINAL_ID });
    expect(store.replying()).toBeNull();
  });

  it('keeps the quote when an edit of the reply arrives without one', () => {
    const quote: SupportMessage['replyTo'] = { id: T.ORIGINAL_ID, senderUserId: null, senderName: null, body: T.QUOTED, kind: 'TEXT', deleted: false };
    const current = [message({ replyTo: quote })];
    const [merged] = SupportChatHelper.upsertMessage({ current, incoming: message({ body: T.EDITED }) });

    expect(merged?.body).toBe(T.EDITED);
    expect(merged?.replyTo).toEqual(quote);
  });
});

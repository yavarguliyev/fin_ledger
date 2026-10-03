import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { Subject } from 'rxjs';

import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportMessage } from '../../src/app/core/types/support/support-message.type';
import { SupportUploadStore } from '../../src/app/core/services/support-upload.store';
import { ToastService } from '../../src/app/core/services/toast.service';
import { UploadProgressHelper } from '../../src/app/core/helpers/http/upload-progress.helper';
import { UPLOAD_PROGRESS_TEST as T } from '../constants/upload-progress.constant';
import { aSupportMessage } from '../fakes/support.fake';

const file = new File([T.CONTENT], T.FILE_NAME);
const upsertMessage = jest.fn();
let events = new Subject<HttpEvent<SupportMessage[]>>();

const create = (): SupportUploadStore => {
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { sendAttachments: (): Subject<HttpEvent<SupportMessage[]>> => events } },
      { provide: SupportChatStore, useValue: { upsertMessage } },
      { provide: ToastService, useValue: { error: jest.fn() } }
    ]
  });
  return runInInjectionContext(injector, () => new SupportUploadStore());
};

describe('Chat attachment uploads', () => {
  beforeEach(() => {
    events = new Subject<HttpEvent<SupportMessage[]>>();
    upsertMessage.mockClear();
  });

  it('reports progress, then adds the sent messages and clears the bar', () => {
    const uploads = create();
    uploads.start({ conversationId: T.CONVERSATION, body: T.BODY, files: [file] });
    events.next({ type: HttpEventType.UploadProgress, loaded: T.LOADED, total: T.TOTAL });
    expect(uploads.progress()).toBe(T.QUARTER);

    events.next(new HttpResponse({ status: T.OK, body: [aSupportMessage({ id: T.FILE_NAME })] }));
    expect(upsertMessage).toHaveBeenCalledTimes(1);
    expect(uploads.uploading()).toBe(false);
  });

  it('stops the request when the user cancels', () => {
    const uploads = create();
    uploads.start({ conversationId: T.CONVERSATION, body: T.BODY, files: [file] });
    uploads.cancel();

    expect(events.observed).toBe(false);
    expect(uploads.uploading()).toBe(false);
  });

  it('ignores events that are not upload progress', () => {
    expect(UploadProgressHelper.percentOf({ event: { type: HttpEventType.Sent } })).toBeNull();
  });
});

import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';

import { LinkPreviewHelper } from '../../../src/app/core/helpers/support/link-preview.helper';
import { AppConfigService } from '../../../src/app/core/services/app-config.service';
import { SupportLinkStore } from '../../../src/app/core/services/support-link.store';
import { LINK_PREVIEW_TEST as T } from '../../constants/link-preview.constant';

describe('LinkPreviewHelper', () => {
  it('finds the first link in a message and drops trailing punctuation', () => {
    expect(LinkPreviewHelper.firstUrl({ text: T.SENTENCE })).toBe(T.FIRST_URL);
    expect(LinkPreviewHelper.firstUrl({ text: T.BRACKETED })).toBe(T.BRACKETED_URL);
    expect(LinkPreviewHelper.firstUrl({ text: T.PLAIN })).toBeNull();
  });

  it('shows the host of a link, or the text itself when it is not a valid URL', () => {
    expect(LinkPreviewHelper.host({ url: T.FIRST_URL })).toBe(T.HOST);
    expect(LinkPreviewHelper.host({ url: T.BROKEN })).toBe(T.BROKEN);
  });
});

describe('SupportLinkStore', () => {
  it('asks the API once per link and shares the result', () => {
    const get = jest.fn().mockReturnValue(of({ url: T.FIRST_URL, title: T.TITLE }));
    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: { get } },
        { provide: AppConfigService, useValue: { apiUrl: T.API_URL } },
        { provide: SupportLinkStore }
      ]
    });
    const store = runInInjectionContext(injector, () => injector.get(SupportLinkStore));

    const first = store.preview({ url: T.FIRST_URL });
    const second = store.preview({ url: T.FIRST_URL });

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(T.PREVIEW_PATH, { params: { url: T.FIRST_URL } });
    expect(second()).toEqual(first());
    expect(first()?.title).toBe(T.TITLE);
  });
});

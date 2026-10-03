import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { HttpRequestError } from '../../src/app/core/errors/http-request.error';
import { PasskeySummary } from '../../src/app/core/interfaces/passkey/passkey-summary.interface';
import { PasskeyService } from '../../src/app/core/services/passkey.service';
import { PasskeyListService } from '../../src/app/features/profile/passkeys/services/passkey-list.service';
import { PROFILE_SECTIONS_TEST as T } from '../constants/profile-sections.constant';

const list = jest.fn<Observable<PasskeySummary[]>, []>();
const create = (): PasskeyListService =>
  runInInjectionContext(Injector.create({ providers: [{ provide: PasskeyService, useValue: { list } }] }), () => new PasskeyListService());
const aPasskey = (): PasskeySummary => ({ id: T.PASSKEY_ID, deviceLabel: null, backedUp: false, lastUsedAt: null, createdAt: T.CREATED_AT });

describe('Passkey list in the profile', () => {
  it('tells an empty list apart from one that has not loaded', () => {
    const store = create();

    expect(store.loaded()).toBe(false);

    list.mockReturnValue(of([]));
    store.refresh();

    expect(store.loaded()).toBe(true);
    expect(store.items()).toHaveLength(0);
  });

  it('reports a failed load as an error, not as having no passkeys, and recovers on retry', () => {
    const store = create();
    list.mockReturnValue(throwError(() => new HttpRequestError({ message: T.MESSAGE, status: T.STATUS })));
    store.refresh();

    expect(store.failed()).toBe(true);
    expect(store.loaded()).toBe(false);

    list.mockReturnValue(of([aPasskey()]));
    store.refresh();

    expect(store.failed()).toBe(false);
    expect(store.items()).toHaveLength(1);
  });
});

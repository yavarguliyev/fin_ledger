import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { HttpRequestError } from '../../src/app/core/errors/http-request.error';
import { MfaStatus } from '../../src/app/core/interfaces/auth/mfa-status.interface';
import { MfaService } from '../../src/app/core/services/mfa.service';
import { MfaStatusService } from '../../src/app/features/profile/two-factor/services/mfa-status.service';
import { PROFILE_SECTIONS_TEST as T } from '../constants/profile-sections.constant';

const getStatus = jest.fn<Observable<MfaStatus>, []>();
const create = (): MfaStatusService =>
  runInInjectionContext(Injector.create({ providers: [{ provide: MfaService, useValue: { getStatus } }] }), () => new MfaStatusService());

describe('Two-factor status in the profile', () => {
  it('stays unloaded until the status arrives', () => {
    const store = create();

    expect(store.status()).toBeNull();
    expect(store.failed()).toBe(false);
  });

  it('reports a failed load as an error and recovers on retry', () => {
    const store = create();
    getStatus.mockReturnValue(throwError(() => new HttpRequestError({ message: T.MESSAGE, status: T.STATUS })));
    store.refresh();

    expect(store.failed()).toBe(true);
    expect(store.status()).toBeNull();

    getStatus.mockReturnValue(of({ enabled: true, pending: false, required: false }));
    store.refresh();

    expect(store.failed()).toBe(false);
    expect(store.status()?.enabled).toBe(true);
  });
});

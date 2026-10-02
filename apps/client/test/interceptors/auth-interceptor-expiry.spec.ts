import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';

import { authInterceptor } from '../../src/app/core/interceptors/auth.interceptor';
import { AuthService } from '../../src/app/core/services/auth.service';
import { DeviceService } from '../../src/app/core/services/device.service';
import { SessionRefreshService } from '../../src/app/core/services/session-refresh.service';
import { SESSION_END_TEST as T } from '../constants/session-end.constant';

describe('authInterceptor when the session has already expired', () => {
  it('ends the session locally instead of logging out through the server', async () => {
    const auth = { token: (): string => T.STALE_TOKEN, isLoggingOut: (): boolean => false, expire: jest.fn(), logout: jest.fn() };
    const refresh = { hasFreshAccess: (): boolean => true, canRefresh: (): boolean => true, refresh: jest.fn(() => of(null)) };
    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: SessionRefreshService, useValue: refresh },
        { provide: DeviceService, useValue: { id: (): string => T.DEVICE_ID } }
      ]
    });
    const next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: T.UNAUTHORIZED, url: T.URL })));

    const call = runInInjectionContext(injector, () => authInterceptor(new HttpRequest(T.METHOD, T.URL, {}), next));

    await expect(firstValueFrom(call)).rejects.toMatchObject({ status: T.UNAUTHORIZED });
    expect(refresh.refresh).toHaveBeenCalledTimes(1);
    expect(auth.expire).toHaveBeenCalledTimes(1);
    expect(auth.logout).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('ends the session when the token expired by the clock and the refresh fails, so timers stop retrying', async () => {
    const auth = { token: (): string => T.STALE_TOKEN, isLoggingOut: (): boolean => false, expire: jest.fn(), logout: jest.fn() };
    const refresh = { hasFreshAccess: (): boolean => false, canRefresh: (): boolean => true, refresh: jest.fn(() => of(null)) };
    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: SessionRefreshService, useValue: refresh },
        { provide: DeviceService, useValue: { id: (): string => T.DEVICE_ID } }
      ]
    });
    const next = jest.fn();

    const call = runInInjectionContext(injector, () => authInterceptor(new HttpRequest(T.METHOD, T.URL, {}), next));

    await expect(firstValueFrom(call)).rejects.toMatchObject({ status: T.UNAUTHORIZED });
    expect(auth.expire).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});

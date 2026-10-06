import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

import { UpdateProfileResponse } from '../../src/app/core/interfaces/auth/update-profile-response.interface';
import { AppConfigService } from '../../src/app/core/services/app-config.service';
import { AuthService } from '../../src/app/core/services/auth.service';
import { UserService } from '../../src/app/core/services/user.service';
import { AuthUser } from '../../src/app/core/types/auth/auth-user.type';
import { CURRENT_USER_CACHE_TEST as T } from '../constants/current-user-cache.constant';

const user = { id: T.USER_ID } as AuthUser;
const get = jest.fn<Observable<UpdateProfileResponse>, [string]>();
const currentUser = signal<AuthUser | null>(null);
const auth = { currentUser, updateCurrentUser: ({ user: next }: UpdateProfileResponse): void => currentUser.set(next) };

const create = (): UserService =>
  runInInjectionContext(
    Injector.create({
      providers: [
        { provide: HttpClient, useValue: { get } },
        { provide: AppConfigService, useValue: { apiUrl: T.API } },
        { provide: AuthService, useValue: auth }
      ]
    }),
    () => new UserService()
  );

describe('Current user fetched once per visit window', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockReturnValue(of({ user }));
    currentUser.set(null);
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW);
  });

  afterEach(() => jest.restoreAllMocks());

  it('reuses the stored user when the profile is reopened soon after', () => {
    const users = create();
    users.ensureCurrentUser().subscribe();
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW + T.WITHIN_WINDOW_MS);
    users.ensureCurrentUser().subscribe(response => expect(response.user).toBe(user));

    expect(get).toHaveBeenCalledTimes(T.ONE_CALL);
  });

  it('fetches again once stale, or when no user is stored', () => {
    const users = create();
    users.ensureCurrentUser().subscribe();
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW + T.PAST_WINDOW_MS);
    users.ensureCurrentUser().subscribe();
    expect(get).toHaveBeenCalledTimes(T.TWO_CALLS);

    currentUser.set(null);
    users.ensureCurrentUser().subscribe();
    expect(get).toHaveBeenCalledTimes(T.TWO_CALLS + T.ONE_CALL);
  });
});

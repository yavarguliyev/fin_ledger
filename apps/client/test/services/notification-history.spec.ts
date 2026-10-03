import { Injector, runInInjectionContext, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { AppConfigService } from '../../src/app/core/services/app-config.service';
import { AppNotification } from '../../src/app/core/types/notification/app-notification.type';
import { NotificationHistoryService } from '../../src/app/core/services/notification-history.service';
import { NotificationService } from '../../src/app/core/services/notification.service';
import { ToastService } from '../../src/app/core/services/toast.service';
import { NOTIFICATION_HISTORY_TEST as T } from '../constants/notification-history.constant';

const oldest = { id: T.OLDEST_ID, createdAt: T.OLDEST_AT } as AppNotification;
const get = jest.fn<Observable<AppNotification[]>, [string, { params: Record<string, string> }]>();
const appendOlder = jest.fn();
const pageOf = (count: number): AppNotification[] => Array.from({ length: count }, () => oldest);
const getNotifications = jest.fn<Observable<AppNotification[]>, [number]>();

const create = (): NotificationHistoryService => {
  const injector = Injector.create({
    providers: [
      { provide: HttpClient, useValue: { get } },
      { provide: AppConfigService, useValue: { apiUrl: T.API } },
      { provide: NotificationService, useValue: { notifications: signal([oldest]), appendOlder, getNotifications } },
      { provide: ToastService, useValue: { error: jest.fn() } }
    ]
  });
  return runInInjectionContext(injector, () => new NotificationHistoryService());
};

describe('NotificationHistoryService', () => {
  beforeEach(() => [get, appendOlder, getNotifications].forEach(mock => mock.mockReset()));

  const opened = (firstPage: number): NotificationHistoryService => {
    getNotifications.mockReturnValue(of(pageOf(firstPage)));
    const history = create();
    history.loadFirst().subscribe();
    return history;
  };

  it('asks for the page before the oldest notification it has', () => {
    get.mockReturnValue(of([]));
    const history = opened(T.FULL_PAGE);
    history.loadOlder();

    expect(get.mock.calls[0]?.[1].params).toMatchObject({ before: T.OLDEST_AT, beforeId: T.OLDEST_ID });
  });

  it('stops offering older pages once a page comes back short', () => {
    get.mockReturnValue(of(pageOf(T.SHORT_PAGE)));
    const history = opened(T.FULL_PAGE);
    history.loadOlder();

    expect(appendOlder).toHaveBeenCalledTimes(1);
    expect(history.hasMore()).toBe(false);
  });

  it('does not ask at all when the first page was already short', () => {
    const history = opened(T.SHORT_PAGE);
    history.loadOlder();

    expect(get).not.toHaveBeenCalled();
  });
});

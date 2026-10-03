import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { HttpRequestError } from '../../src/app/core/errors/http-request.error';
import { LOAD_STATE } from '../../src/app/core/constants/ui/load-state.constant';
import { LOAD_STATUS } from '../../src/app/core/constants/ui/load-status.constant';
import { NotificationService } from '../../src/app/core/services/notification.service';
import { NotificationHistoryService } from '../../src/app/core/services/notification-history.service';
import { NotificationsComponent } from '../../src/app/features/notifications/notifications.component';
import { SkeletonComponent } from '../../src/app/shared/components/skeleton/skeleton.component';
import { LOAD_STATE_TEST as T } from '../constants/load-state.constant';

const getNotifications = jest.fn<Observable<unknown>, [number]>();

const create = (): NotificationsComponent => {
  const injector = Injector.create({
    providers: [
      { provide: NotificationService, useValue: { getNotifications, notifications: signal([]), unreadCount: signal(0) } },
      { provide: NotificationHistoryService, useValue: { loadFirst: (): Observable<unknown> => getNotifications(T.PAGE_SIZE), hasMore: signal(false), loading: signal(false) } }
    ]
  });
  return runInInjectionContext(injector, () => new NotificationsComponent());
};

describe('Notifications page load states', () => {
  it('shows the list once notifications arrive', () => {
    getNotifications.mockReturnValue(of([]));
    const page = create();
    page.load();

    expect(page.status()).toBe(LOAD_STATUS.READY);
  });

  it('shows an error with a retry when the request fails, and recovers on retry', () => {
    getNotifications.mockReturnValue(throwError(() => new HttpRequestError({ message: T.MESSAGE, status: T.STATUS })));
    const page = create();
    page.load();

    expect(page.status()).toBe(LOAD_STATUS.ERROR);

    getNotifications.mockReturnValue(of([]));
    page.load();
    expect(page.status()).toBe(LOAD_STATUS.READY);
  });
});

describe('SkeletonComponent', () => {
  it('draws three placeholder rows by default', () => {
    const skeleton = runInInjectionContext(Injector.create({ providers: [] }), () => new SkeletonComponent());

    expect(skeleton.lines()).toHaveLength(LOAD_STATE.DEFAULT_ROWS);
  });
});

import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { getSessionUser, RequestContext } from '@common/libs';

import { NotificationDto } from '../dtos/notification/notification.dto';
import { StreamSubjectKeyDto } from '../dtos/stream/stream-subject-key.dto';

@Injectable()
export class NotificationStreamProvider {
  private readonly stream$ = new Subject<StreamSubjectKeyDto>();

  broadcast (userId: string, notification: NotificationDto): void {
    this.stream$.next({ userId, notification });
  }

  getStream (context: RequestContext, token?: string): Observable<NotificationDto> {
    if (token) {
      context.headers = context.headers || {};
      context.headers.authorization = `Bearer ${token}`;
    }

    return this.stream$.asObservable().pipe(
      filter(event => event.userId === getSessionUser(context).userId),
      map(event => event.notification)
    );
  }
}

import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { NotificationDto } from '../dtos/notification/notification.dto';
import { StreamSubjectKeyDto } from '../dtos/stream/stream-subject-key.dto';
import { GetNotificationStreamDto } from '../dtos/input/get-notification-stream.dto';

@Injectable()
export class NotificationStreamProvider {
  private readonly stream$ = new Subject<StreamSubjectKeyDto>();

  broadcast (event: StreamSubjectKeyDto): void {
    this.stream$.next(event);
  }

  getStream ({ userId }: GetNotificationStreamDto): Observable<NotificationDto> {
    return this.stream$.asObservable().pipe(
      filter(event => event.userId === userId),
      map(event => event.notification)
    );
  }
}

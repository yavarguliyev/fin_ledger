import { Injectable } from '@nestjs/common';
import { Observable, map } from 'rxjs';

import { GetNotificationStreamDto } from '../../dtos/input/get-notification-stream.dto';
import { NotificationStreamProvider } from '../../providers/notification-stream.provider';

@Injectable()
export class StreamNotificationsUseCase {
  constructor (private readonly streamProvider: NotificationStreamProvider) {}

  execute (dto: GetNotificationStreamDto): Observable<MessageEvent> {
    return this.streamProvider.getStream(dto).pipe(map(notification => ({ data: notification }) as MessageEvent));
  }
}

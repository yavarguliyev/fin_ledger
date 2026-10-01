import { Injectable } from '@nestjs/common';
import { Observable, Subject, filter, map } from 'rxjs';

import { SupportStreamEventDto } from '../dtos/stream/support-stream-event.dto';
import { SupportStreamHelper } from '../helpers/support-stream.helper';
import { SupportStreamPayloadDto } from '../dtos/stream/support-stream-payload.dto';
import { SupportStreamViewerDto } from '../dtos/stream/support-stream-viewer.dto';

@Injectable()
export class SupportStreamProvider {
  private readonly stream$ = new Subject<SupportStreamEventDto>();

  broadcast (event: SupportStreamEventDto): void {
    this.stream$.next(event);
  }

  getStream ({ userId, role }: SupportStreamViewerDto): Observable<SupportStreamPayloadDto> {
    return this.stream$.asObservable().pipe(
      filter(event => SupportStreamHelper.isFor({ event, userId, role })),
      map(event => SupportStreamHelper.toPayload({ event }))
    );
  }
}

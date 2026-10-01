import { Injectable } from '@nestjs/common';
import { Observable, map } from 'rxjs';

import { SupportStreamProvider } from '../../../providers/support-stream.provider';
import { SupportStreamViewerDto } from '../../../dtos/stream/support-stream-viewer.dto';

@Injectable()
export class StreamSupportEventsUseCase {
  constructor (private readonly stream: SupportStreamProvider) {}

  execute (dto: SupportStreamViewerDto): Observable<MessageEvent> {
    return this.stream.getStream(dto).pipe(map(payload => ({ data: payload }) as MessageEvent));
  }
}

import { HttpEventType } from '@angular/common/http';

import { HttpEventRefDto } from '../../interfaces/http/http-event-ref.interface';
import { UPLOAD_PROGRESS } from '../../constants/http/upload-progress.constant';

export class UploadProgressHelper {
  static percentOf ({ event }: HttpEventRefDto): number | null {
    if (event.type !== HttpEventType.UploadProgress || !event.total) return null;
    return Math.min(UPLOAD_PROGRESS.FULL, Math.round((event.loaded / event.total) * UPLOAD_PROGRESS.FULL));
  }
}

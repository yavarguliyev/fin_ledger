import type { HttpEvent } from '@angular/common/http';

export interface HttpEventRefDto {
  event: HttpEvent<unknown>;
}

import { HttpResponse } from '@angular/common/http';

export interface CachedResponse {
  response: HttpResponse<unknown>;
  expiresAt: number;
}

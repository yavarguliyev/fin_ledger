import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { HttpRequestError } from '../../errors/http-request.error';

export class HttpErrorHelper {
  static handleHttpError (error: HttpErrorResponse): Observable<never> {
    const errorMessage = HttpErrorHelper.extractErrorMessage(error);
    return throwError(() => new HttpRequestError({ message: errorMessage, status: error.status }));
  }

  private static extractErrorMessage (error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) return error.error.message;
    if (typeof error.error === 'string' && error.error.trim().length > 0) return error.error;

    const extracted = HttpErrorHelper.extractMessageFromObject(error.error);

    if (extracted) return extracted;
    if (error.status === 0) return 'Cannot connect to server. Please check your connection.';
    if (error.status === 401) return 'Unauthorized. Please sign in again.';
    return 'An error occurred. Please try again.';
  }

  private static extractMessageFromObject (payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) return null;

    const obj = payload as Record<string, unknown>;

    if (typeof obj['message'] === 'string' && obj['message'].trim().length > 0) return obj['message'];
    if (Array.isArray(obj['message']) && obj['message'].length > 0) return obj['message'].filter(m => typeof m === 'string').join(', ');
    if (typeof obj['error'] === 'object' && obj['error'] !== null) return HttpErrorHelper.extractMessageFromObject(obj['error']);

    return null;
  }
}

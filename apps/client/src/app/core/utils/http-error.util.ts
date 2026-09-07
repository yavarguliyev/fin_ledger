import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

const extractMessageFromObject = (payload: unknown): string | null => {
  if (typeof payload !== 'object' || payload === null) return null;

  const obj = payload as Record<string, unknown>;

  if (typeof obj['message'] === 'string' && obj['message'].trim().length > 0) {
    return obj['message'];
  }

  if (Array.isArray(obj['message']) && obj['message'].length > 0) {
    return obj['message'].filter(m => typeof m === 'string').join(', ');
  }

  if (typeof obj['error'] === 'object' && obj['error'] !== null) {
    return extractMessageFromObject(obj['error']);
  }

  return null;
};

const extractErrorMessage = (error: HttpErrorResponse): string => {
  if (error.error instanceof ErrorEvent) return error.error.message;

  if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return error.error;
  }

  const extracted = extractMessageFromObject(error.error);
  if (extracted) return extracted;

  if (error.status === 0) {
    return 'Cannot connect to server. Please check your connection.';
  }

  if (error.status === 401) {
    return 'Unauthorized. Please sign in again.';
  }

  return 'An error occurred. Please try again.';
};

export const handleHttpError = (error: HttpErrorResponse): Observable<never> => {
  const errorMessage = extractErrorMessage(error);
  return throwError(() => new Error(errorMessage));
};

import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { HttpRequestError } from '../../errors/http-request.error';
import { HTTP_ERRORS } from '../../constants/http/http-errors.constant';
import { SESSION } from '../../constants/auth/session.constant';
import { FieldIssueDto } from '../../dtos/http/field-issue.dto';

export class HttpErrorHelper {
  static handleHttpError (error: HttpErrorResponse): Observable<never> {
    const message = HttpErrorHelper.extractErrorMessage(error);
    const fieldErrors = HttpErrorHelper.extractFieldErrors(error.error);
    const silent = error.statusText === SESSION.NO_SESSION_MESSAGE;

    return throwError(() => new HttpRequestError({ message, status: error.status, fieldErrors, silent }));
  }

  static extractFieldErrors (payload: unknown): Record<string, string> {
    const issues = HttpErrorHelper.issuesOf(payload);
    const fieldErrors: Record<string, string> = {};

    for (const issue of issues) {
      const described = HttpErrorHelper.fieldOf(issue);
      if (described && !fieldErrors[described.field]) fieldErrors[described.field] = described.message;
    }

    return fieldErrors;
  }

  private static extractValidationMessage (payload: Record<string, unknown>): string | null {
    const issues = payload[HTTP_ERRORS.ISSUES_KEY];
    if (!Array.isArray(issues) || issues.length === 0) return null;
    const described = issues.map(issue => HttpErrorHelper.describeIssue(issue)).filter((line): line is string => line !== null);
    return described.length > 0 ? described.join(HTTP_ERRORS.ISSUE_SEPARATOR) : null;
  }

  private static issuesOf (payload: unknown): unknown[] {
    if (typeof payload !== 'object' || payload === null) return [];

    const record = payload as Record<string, unknown>;
    const issues = record[HTTP_ERRORS.ISSUES_KEY];

    if (Array.isArray(issues)) return issues;
    return HttpErrorHelper.issuesOf(record[HTTP_ERRORS.ERROR_KEY]);
  }

  private static fieldOf (issue: unknown): FieldIssueDto | null {
    if (typeof issue !== 'object' || issue === null) return null;

    const record = issue as Record<string, unknown>;
    const message = typeof record[HTTP_ERRORS.MESSAGE_KEY] === 'string' ? (record[HTTP_ERRORS.MESSAGE_KEY] as string) : null;
    const path = record[HTTP_ERRORS.PATH_KEY];
    const field = Array.isArray(path) && path.length > 0 ? String(path[path.length - 1]) : null;

    return message && field ? { field, message } : null;
  }

  private static extractErrorMessage (error: HttpErrorResponse): string {
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) return error.error.message;
    if (typeof error.error === 'string' && error.error.trim().length > 0) return error.error;

    const extracted = HttpErrorHelper.extractMessageFromObject(error.error);

    if (extracted) return extracted;
    if (error.status === HTTP_ERRORS.OFFLINE_STATUS) return HTTP_ERRORS.OFFLINE_MESSAGE;
    if (error.status === HTTP_ERRORS.UNAUTHORIZED_STATUS) return HTTP_ERRORS.UNAUTHORIZED_MESSAGE;

    return HTTP_ERRORS.FALLBACK_MESSAGE;
  }

  private static describeIssue (issue: unknown): string | null {
    if (typeof issue === 'string') return issue;
    if (typeof issue !== 'object' || issue === null) return null;

    const record = issue as Record<string, unknown>;
    const message = typeof record['message'] === 'string' ? record['message'] : null;
    if (!message) return null;

    const path = Array.isArray(record['path']) ? record['path'].join(HTTP_ERRORS.PATH_SEPARATOR) : null;
    return path ? `${path}: ${message}` : message;
  }

  private static extractMessageFromObject (payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) return null;

    const obj = payload as Record<string, unknown>;

    const validation = HttpErrorHelper.extractValidationMessage(obj);
    if (validation) return validation;

    if (typeof obj['message'] === 'string' && obj['message'].trim().length > 0) return obj['message'];
    if (Array.isArray(obj['message']) && obj['message'].length > 0) return obj['message'].filter(m => typeof m === 'string').join(', ');
    if (typeof obj['error'] === 'object' && obj['error'] !== null) return HttpErrorHelper.extractMessageFromObject(obj['error']);

    return null;
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { AnswerCallDto } from '../dtos/support/answer-call.dto';
import { AppConfigService } from './app-config.service';
import { CallCandidateDto } from '../dtos/support/call-candidate.dto';
import { CallConfigDto } from '../dtos/support/call-config.dto';
import { CallIdDto } from '../dtos/support/call-id.dto';
import { EndCallDto } from '../dtos/support/end-call.dto';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { StartCallDto } from '../dtos/support/start-call.dto';
import { SUPPORT } from '../constants/support/support.constant';
import { SUPPORT_CALL } from '../constants/support/support-call.constant';

@Injectable({ providedIn: 'root' })
export class SupportCallApiService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private get callsUrl (): string {
    return `${this.config.apiUrl}${SUPPORT.BASE_PATH}${SUPPORT_CALL.CALLS_PATH}`;
  }

  callConfig (): Observable<CallConfigDto> {
    return this.send(this.http.get<CallConfigDto>(`${this.config.apiUrl}${SUPPORT.BASE_PATH}${SUPPORT_CALL.CONFIG_PATH}`));
  }

  start (dto: StartCallDto): Observable<CallIdDto> {
    return this.send(this.http.post<CallIdDto>(this.callsUrl, dto));
  }

  answer ({ callId, sdp }: AnswerCallDto): Observable<unknown> {
    return this.send(this.http.post(`${this.callsUrl}/${callId}${SUPPORT_CALL.ANSWER_PATH}`, { sdp }));
  }

  candidate ({ callId, candidate }: CallCandidateDto): Observable<unknown> {
    return this.send(this.http.post(`${this.callsUrl}/${callId}${SUPPORT_CALL.CANDIDATES_PATH}`, { candidate }));
  }

  end ({ callId, reason }: EndCallDto): Observable<unknown> {
    return this.send(this.http.post(`${this.callsUrl}/${callId}${SUPPORT_CALL.END_PATH}`, { reason }));
  }

  private send<T> (request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { ConversationPatch } from '../types/support/conversation-patch.type';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { PreferenceUpdateDto } from '../interfaces/support/preference-update.interface';
import { SUPPORT } from '../constants/support/support.constant';

@Injectable({ providedIn: 'root' })
export class SupportPreferencesApiService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  update ({ conversationId, path, body }: PreferenceUpdateDto): Observable<ConversationPatch> {
    const url = `${this.config.apiUrl}${SUPPORT.BASE_PATH}${SUPPORT.CONVERSATIONS_PATH}/${conversationId}${path}`;
    return this.http.put<ConversationPatch>(url, body).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { ClearChatDto } from '../interfaces/support/clear-chat.interface';
import { ClearedChat } from '../interfaces/support/cleared-chat.interface';
import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { DeletedMessages } from '../interfaces/support/deleted-messages.interface';
import { DeleteManyDto } from '../interfaces/support/delete-many.interface';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { SUPPORT } from '../constants/support/support.constant';
import { SUPPORT_HISTORY } from '../constants/support/support-history.constant';

@Injectable({ providedIn: 'root' })
export class SupportHistoryApiService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  clear ({ conversationId, keepStarred }: ClearChatDto): Observable<ClearedChat> {
    return this.send(this.http.post<ClearedChat>(`${this.url({ conversationId })}${SUPPORT_HISTORY.PATHS.CLEAR}`, { keepStarred }));
  }

  deleteMany ({ conversationId, messageIds, scope }: DeleteManyDto): Observable<DeletedMessages> {
    return this.send(this.http.post<DeletedMessages>(`${this.url({ conversationId })}${SUPPORT_HISTORY.PATHS.DELETE_MANY}`, { messageIds, scope }));
  }

  private url ({ conversationId }: ConversationRefDto): string {
    return `${this.config.apiUrl}${SUPPORT.BASE_PATH}${SUPPORT.CONVERSATIONS_PATH}/${conversationId}`;
  }

  private send<T> (request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}

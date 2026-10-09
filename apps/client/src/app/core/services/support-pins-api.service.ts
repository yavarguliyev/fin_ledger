import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { MessageInConversationDto } from '../interfaces/support/message-in-conversation.interface';
import { PinMessageDto } from '../interfaces/support/pin-message.interface';
import { SUPPORT } from '../constants/support/support.constant';
import { SUPPORT_PINS } from '../constants/support/support-pins.constant';
import { SupportMessage } from '../types/support/support-message.type';

@Injectable({ providedIn: 'root' })
export class SupportPinsApiService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  list ({ conversationId }: ConversationRefDto): Observable<SupportMessage[]> {
    return this.send(this.http.get<SupportMessage[]>(`${this.url({ conversationId })}${SUPPORT_PINS.PINS_PATH}`));
  }

  pin ({ conversationId, messageId, duration }: PinMessageDto): Observable<SupportMessage[]> {
    return this.send(this.http.put<SupportMessage[]>(this.pinUrl({ conversationId, messageId }), { duration }));
  }

  unpin ({ conversationId, messageId }: MessageInConversationDto): Observable<SupportMessage[]> {
    return this.send(this.http.delete<SupportMessage[]>(this.pinUrl({ conversationId, messageId })));
  }

  private pinUrl ({ conversationId, messageId }: MessageInConversationDto): string {
    return `${this.url({ conversationId })}${SUPPORT_PINS.MESSAGES_PATH}${messageId}${SUPPORT_PINS.PIN_PATH}`;
  }

  private url ({ conversationId }: ConversationRefDto): string {
    return `${this.config.apiUrl}${SUPPORT.BASE_PATH}${SUPPORT.CONVERSATIONS_PATH}/${conversationId}`;
  }

  private send<T> (request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}

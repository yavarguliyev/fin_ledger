import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { ContactCard } from '../interfaces/support/contact-card.interface';
import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { DeletedFiles } from '../interfaces/support/deleted-files.interface';
import { DeleteFilesDto } from '../interfaces/support/delete-files.interface';
import { DownloadLink } from '../interfaces/support/download-link.interface';
import { MessageInConversationDto } from '../interfaces/support/message-in-conversation.interface';
import { PrivacyChangeDto } from '../interfaces/support/privacy-change.interface';
import { PrivacyState } from '../interfaces/support/privacy-state.interface';
import { LockState } from '../interfaces/support/lock-state.interface';
import { PASSKEY } from '../constants/passkey/passkey.constant';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { PanelPageDto } from '../interfaces/support/panel-page.interface';
import { StarMessageDto } from '../interfaces/support/star-message.interface';
import { StarredMessage } from '../interfaces/support/starred-message.interface';
import { StorageSummary } from '../interfaces/support/storage-summary.interface';
import { SUPPORT } from '../constants/support/support.constant';
import { SUPPORT_PANEL } from '../constants/support/support-panel.constant';

@Injectable({ providedIn: 'root' })
export class SupportPanelApiService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private get apiUrl (): string {
    return `${this.config.apiUrl}${SUPPORT.BASE_PATH}`;
  }

  contact ({ conversationId }: ConversationRefDto): Observable<ContactCard> {
    return this.send(this.http.get<ContactCard>(`${this.conversationUrl({ conversationId })}${SUPPORT_PANEL.CONTACT_PATH}`));
  }

  page<T> ({ conversationId, tab, before, beforeId }: PanelPageDto): Observable<T[]> {
    const query = new URLSearchParams({ [SUPPORT_PANEL.LIMIT_PARAM]: String(SUPPORT_PANEL.PAGE_SIZE) });
    if (before && beforeId) {
      query.set(SUPPORT_PANEL.BEFORE_PARAM, before);
      query.set(SUPPORT_PANEL.BEFORE_ID_PARAM, beforeId);
    }
    return this.send(this.http.get<T[]>(`${this.conversationUrl({ conversationId })}/${tab}?${query.toString()}`));
  }

  storage ({ conversationId }: ConversationRefDto): Observable<StorageSummary> {
    return this.send(this.http.get<StorageSummary>(`${this.conversationUrl({ conversationId })}${SUPPORT_PANEL.STORAGE_PATH}`));
  }

  deleteFiles ({ conversationId, messageIds }: DeleteFilesDto): Observable<DeletedFiles> {
    const url = `${this.conversationUrl({ conversationId })}${SUPPORT_PANEL.STORAGE_PATH}`;
    return this.send(this.http.delete<DeletedFiles>(url, { body: { messageIds } }));
  }

  starred ({ conversationId }: ConversationRefDto): Observable<StarredMessage[]> {
    return this.send(this.http.get<StarredMessage[]>(`${this.conversationUrl({ conversationId })}${SUPPORT_PANEL.STARRED_PATH}`));
  }

  allStarred (): Observable<StarredMessage[]> {
    return this.send(this.http.get<StarredMessage[]>(`${this.apiUrl}${SUPPORT_PANEL.STARRED_PATH}`));
  }

  star ({ conversationId, messageId, starred }: StarMessageDto): Observable<StarredMessage[]> {
    const url = `${this.conversationUrl({ conversationId })}${SUPPORT.MESSAGES_PATH}/${messageId}${SUPPORT_PANEL.STAR_PATH}`;
    return this.send(starred ? this.http.put<StarredMessage[]>(url, {}) : this.http.delete<StarredMessage[]>(url));
  }

  changePrivacy ({ conversationId, enabled }: PrivacyChangeDto): Observable<PrivacyState> {
    return this.send(this.http.put<PrivacyState>(`${this.conversationUrl({ conversationId })}${SUPPORT_PANEL.PRIVACY_PATH}`, { enabled }));
  }

  download ({ conversationId, messageId }: MessageInConversationDto): Observable<DownloadLink> {
    const url = `${this.conversationUrl({ conversationId })}${SUPPORT.MESSAGES_PATH}/${messageId}${SUPPORT_PANEL.DOWNLOAD_PATH}`;
    return this.send(this.http.get<DownloadLink>(url));
  }

  lock ({ conversationId }: ConversationRefDto): Observable<LockState> {
    return this.send(this.http.post<LockState>(`${this.config.apiUrl}${PASSKEY.BASE_PATH}${SUPPORT_PANEL.CHAT_LOCK_PATH}`, { conversationId }));
  }

  unlock ({ conversationId }: ConversationRefDto): Observable<LockState> {
    return this.send(this.http.post<LockState>(`${this.config.apiUrl}${PASSKEY.BASE_PATH}${SUPPORT_PANEL.CHAT_UNLOCK_PATH}`, { conversationId }));
  }

  removeLock ({ conversationId }: ConversationRefDto): Observable<LockState> {
    return this.send(this.http.delete<LockState>(`${this.conversationUrl({ conversationId })}${SUPPORT_PANEL.LOCK_PATH}`));
  }

  private conversationUrl ({ conversationId }: ConversationRefDto): string {
    return `${this.apiUrl}${SUPPORT.CONVERSATIONS_PATH}/${conversationId}`;
  }

  private send<T> (request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}

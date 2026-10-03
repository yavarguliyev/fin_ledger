import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { MessageHit } from '../interfaces/support/message-hit.interface';
import { SearchMessagesDto } from '../interfaces/support/search-messages.interface';
import { MESSAGE_REACTION } from '../constants/support/message-reaction.constant';
import { Reaction } from '../interfaces/support/reaction.interface';
import { ReactMessageDto } from '../interfaces/support/react-message.interface';
import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { ListSupportMessagesDto } from '../interfaces/support/list-support-messages.interface';
import { PresenceEntry } from '../types/support/presence-entry.type';
import { SUPPORT } from '../constants/support/support.constant';
import { LastSeenDto } from '../interfaces/support/last-seen.interface';
import { UserIdRefDto } from '../interfaces/support/user-id-ref.interface';
import { StaffRefDto } from '../interfaces/support/staff-ref.interface';
import { SendAttachmentsDto } from '../interfaces/support/send-attachments.interface';
import { DeleteSupportMessageDto } from '../interfaces/support/delete-support-message.interface';
import { SUPPORT_MESSAGE_RULES } from '../constants/support/support-message-rules.constant';
import { EditMessageDto } from '../interfaces/support/edit-message.interface';
import { SUPPORT_ATTACHMENT } from '../constants/support/support-attachment.constant';
import { SendSupportMessageDto } from '../interfaces/support/send-support-message.interface';
import { StreamTicket } from '../interfaces/notification/stream-ticket.interface';
import { StreamTicketRefDto } from '../interfaces/notification/stream-ticket-ref.interface';
import { SupportConversation } from '../types/support/support-conversation.type';
import { SupportMessage } from '../types/support/support-message.type';
import { PresenceCount } from '../interfaces/support/presence-count.interface';

@Injectable({ providedIn: 'root' })
export class SupportApiService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private get apiUrl (): string {
    return `${this.config.apiUrl}${SUPPORT.BASE_PATH}`;
  }

  openConversation ({ staffUserId }: StaffRefDto): Observable<SupportConversation> {
    return this.send(this.http.post<SupportConversation>(`${this.apiUrl}${SUPPORT.CONVERSATIONS_PATH}`, { staffUserId }));
  }

  listConversations (): Observable<SupportConversation[]> {
    return this.send(this.http.get<SupportConversation[]>(`${this.apiUrl}${SUPPORT.CONVERSATIONS_PATH}`));
  }

  sendMessage ({ conversationId, body, replyToMessageId }: SendSupportMessageDto): Observable<SupportMessage> {
    return this.send(this.http.post<SupportMessage>(this.threadUrl({ conversationId }), { body, ...(replyToMessageId && { replyToMessageId }) }));
  }

  sendAttachments ({ conversationId, body, files, durationSeconds }: SendAttachmentsDto): Observable<SupportMessage[]> {
    const form = new FormData();
    files.forEach(file => form.append(SUPPORT_ATTACHMENT.FIELD_NAME, file, file.name));
    if (body) form.append(SUPPORT_ATTACHMENT.BODY_FIELD, body);
    if (durationSeconds) form.append(SUPPORT_ATTACHMENT.DURATION_FIELD, String(durationSeconds));
    return this.send(this.http.post<SupportMessage[]>(`${this.conversationUrl({ conversationId })}${SUPPORT_ATTACHMENT.ATTACHMENTS_PATH}`, form));
  }

  react ({ conversationId, messageId, emoji }: ReactMessageDto): Observable<Reaction[]> {
    const url = `${this.threadUrl({ conversationId })}/${messageId}${MESSAGE_REACTION.PATH}`;
    return this.send(emoji ? this.http.put<Reaction[]>(url, { emoji }) : this.http.delete<Reaction[]>(url));
  }

  editMessage ({ conversationId, messageId, body, file }: EditMessageDto): Observable<SupportMessage> {
    const form = new FormData();
    form.append(SUPPORT_ATTACHMENT.BODY_FIELD, body);
    if (file) form.append(SUPPORT_ATTACHMENT.EDIT_FIELD_NAME, file, file.name);
    return this.send(this.http.patch<SupportMessage>(`${this.threadUrl({ conversationId })}/${messageId}`, form));
  }

  deleteMessage ({ conversationId, messageId, scope }: DeleteSupportMessageDto): Observable<unknown> {
    const query = new URLSearchParams({ [SUPPORT_MESSAGE_RULES.SCOPE_PARAM]: scope });
    return this.send(this.http.delete(`${this.threadUrl({ conversationId })}/${messageId}?${query.toString()}`));
  }

  markRead ({ conversationId }: ConversationRefDto): Observable<unknown> {
    return this.send(this.http.post(`${this.conversationUrl({ conversationId })}${SUPPORT.READ_PATH}`, {}));
  }

  typing ({ conversationId }: ConversationRefDto): Observable<unknown> {
    return this.send(this.http.post(`${this.conversationUrl({ conversationId })}${SUPPORT.TYPING_PATH}`, {}));
  }

  heartbeat (): Observable<unknown> {
    return this.send(this.http.post(`${this.apiUrl}${SUPPORT.HEARTBEAT_PATH}`, {}));
  }

  leavePresence (): Observable<unknown> {
    return this.send(this.http.post(`${this.apiUrl}${SUPPORT.LEAVE_PATH}`, {}));
  }

  lastSeen ({ userId }: UserIdRefDto): Observable<LastSeenDto> {
    return this.send(this.http.get<LastSeenDto>(`${this.apiUrl}${SUPPORT.LAST_SEEN_PATH}?userId=${encodeURIComponent(userId)}`));
  }

  listContacts (): Observable<PresenceEntry[]> {
    return this.send(this.http.get<PresenceEntry[]>(`${this.apiUrl}${SUPPORT.CONTACTS_PATH}`));
  }

  listPresence (): Observable<PresenceEntry[]> {
    return this.send(this.http.get<PresenceEntry[]>(`${this.apiUrl}${SUPPORT.PRESENCE_PATH}`));
  }

  countPresence (): Observable<PresenceCount> {
    return this.send(this.http.get<PresenceCount>(`${this.apiUrl}${SUPPORT.PRESENCE_COUNT_PATH}`));
  }

  streamTicket (): Observable<StreamTicket> {
    return this.send(this.http.post<StreamTicket>(`${this.apiUrl}${SUPPORT.TICKET_PATH}`, {}));
  }

  streamUrl ({ ticket }: StreamTicketRefDto): string {
    return `${this.apiUrl}${SUPPORT.STREAM_PATH}?${SUPPORT.TICKET_PARAM}=${encodeURIComponent(ticket)}`;
  }

  searchMessages ({ conversationId, q }: SearchMessagesDto): Observable<MessageHit[]> {
    const query = new URLSearchParams({ [SUPPORT.SEARCH_PARAM]: q });
    return this.send(this.http.get<MessageHit[]>(`${this.threadUrl({ conversationId })}${SUPPORT.SEARCH_PATH}?${query.toString()}`));
  }

  listMessages ({ conversationId, limit, before }: ListSupportMessagesDto): Observable<SupportMessage[]> {
    const query = new URLSearchParams();
    if (limit) query.set('limit', String(limit));
    if (before) query.set('before', before);
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return this.send(this.http.get<SupportMessage[]>(`${this.threadUrl({ conversationId })}${suffix}`));
  }

  private conversationUrl ({ conversationId }: ConversationRefDto): string {
    return `${this.apiUrl}${SUPPORT.CONVERSATIONS_PATH}/${conversationId}`;
  }

  private threadUrl ({ conversationId }: ConversationRefDto): string {
    return `${this.conversationUrl({ conversationId })}${SUPPORT.MESSAGES_PATH}`;
  }

  private send<T> (request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { ConversationRefDto } from '../dtos/support/conversation-ref.dto';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { ListSupportMessagesDto } from '../dtos/support/list-support-messages.dto';
import { PresenceEntry } from '../types/support/presence-entry.type';
import { SUPPORT } from '../constants/support/support.constant';
import { LastSeenDto } from '../dtos/support/last-seen.dto';
import { UserIdRefDto } from '../dtos/support/user-id-ref.dto';
import { StaffRefDto } from '../dtos/support/staff-ref.dto';
import { SendAttachmentsDto } from '../dtos/support/send-attachments.dto';
import { DeleteSupportMessageDto } from '../dtos/support/delete-support-message.dto';
import { SUPPORT_MESSAGE_RULES } from '../constants/support/support-message-rules.constant';
import { EditMessageDto } from '../dtos/support/edit-message.dto';
import { SUPPORT_ATTACHMENT } from '../constants/support/support-attachment.constant';
import { SendSupportMessageDto } from '../dtos/support/send-support-message.dto';
import { StreamTicket } from '../interfaces/notification/stream-ticket.interface';
import { StreamTicketRefDto } from '../dtos/notification/stream-ticket-ref.dto';
import { SupportConversation } from '../types/support/support-conversation.type';
import { SupportMessage } from '../types/support/support-message.type';

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

  sendMessage ({ conversationId, body }: SendSupportMessageDto): Observable<SupportMessage> {
    return this.send(this.http.post<SupportMessage>(this.threadUrl({ conversationId }), { body }));
  }

  sendAttachments ({ conversationId, body, files, durationSeconds }: SendAttachmentsDto): Observable<SupportMessage[]> {
    const form = new FormData();
    files.forEach(file => form.append(SUPPORT_ATTACHMENT.FIELD_NAME, file, file.name));
    if (body) form.append(SUPPORT_ATTACHMENT.BODY_FIELD, body);
    if (durationSeconds) form.append(SUPPORT_ATTACHMENT.DURATION_FIELD, String(durationSeconds));
    return this.send(this.http.post<SupportMessage[]>(`${this.conversationUrl({ conversationId })}${SUPPORT_ATTACHMENT.ATTACHMENTS_PATH}`, form));
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

  streamTicket (): Observable<StreamTicket> {
    return this.send(this.http.post<StreamTicket>(`${this.apiUrl}${SUPPORT.TICKET_PATH}`, {}));
  }

  streamUrl ({ ticket }: StreamTicketRefDto): string {
    return `${this.apiUrl}${SUPPORT.STREAM_PATH}?${SUPPORT.TICKET_PARAM}=${encodeURIComponent(ticket)}`;
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

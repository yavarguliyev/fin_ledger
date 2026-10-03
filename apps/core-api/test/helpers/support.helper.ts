import { ApiHelper } from './api.helper';
import { DbHelper } from './db.helper';
import { SseReaderHelper } from './sse-reader.helper';
import { SUPPORT_CHAT_TEST as T } from '../constants/support-chat.constant';
import { SUPPORT_HELPER as H } from '../constants/support-helper.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { StreamTicketResponse } from '../interfaces/stream-ticket-response.interface';
import { SupportConversation, SupportMessage } from '../interfaces/support-chat.interface';
import {
  SupportConversationRefDto,
  SupportEmailDto,
  SupportMultipartDto,
  SupportOpenDto,
  SupportSendDto,
  SupportThreadDto,
  SupportTokenDto
} from '../interfaces/support-test.interface';

export class SupportTestHelper {
  static open ({ token, staffUserId, subject }: SupportOpenDto): Promise<ApiResponse<SupportConversation>> {
    return ApiHelper.request<SupportConversation>({ method: 'POST', path: T.CONVERSATIONS_PATH, token, body: { staffUserId, ...(subject && { subject }) } });
  }

  static send ({ token, conversationId, body, replyToMessageId }: SupportSendDto): Promise<ApiResponse<SupportMessage>> {
    const payload = { body, ...(replyToMessageId && { replyToMessageId }) };
    return ApiHelper.request<SupportMessage>({ method: 'POST', path: SupportTestHelper.messagesPath({ conversationId }), token, body: payload });
  }

  static thread ({ token, conversationId }: SupportThreadDto): Promise<ApiResponse<SupportMessage[]>> {
    return ApiHelper.request<SupportMessage[]>({ path: SupportTestHelper.messagesPath({ conversationId }), token });
  }

  static list ({ token }: SupportTokenDto): Promise<ApiResponse<SupportConversation[]>> {
    return ApiHelper.request<SupportConversation[]>({ path: T.CONVERSATIONS_PATH, token });
  }

  static async userId ({ email }: SupportEmailDto): Promise<string> {
    const [row] = await DbHelper.query<{ id: string }>({ sql: T.USER_ID_SQL, params: [email] });
    return row?.id ?? '';
  }

  static multipart ({ method, conversationId, path, token, form }: SupportMultipartDto): Promise<Response> {
    return fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.CONVERSATIONS_PATH}/${conversationId}${path}`, {
      method,
      headers: { [H.AUTHORIZATION_HEADER]: `${H.BEARER_PREFIX}${token}`, [H.FORWARDED_FOR_HEADER]: ApiHelper.randomIp() },
      body: form
    });
  }

  static async openStream ({ token }: SupportTokenDto): Promise<SseReaderHelper> {
    const ticket = await ApiHelper.request<StreamTicketResponse>({ method: 'POST', path: T.STREAM_TICKET_PATH, token, body: {} });
    return SseReaderHelper.open({ path: `${T.STREAM_PATH}${ticket.body.ticket}` });
  }

  static messagesPath ({ conversationId }: SupportConversationRefDto): string {
    return `${T.CONVERSATIONS_PATH}/${conversationId}${H.MESSAGES_SUFFIX}`;
  }
}

import { ApiHelper } from './api.helper';
import { SupportTestHelper } from './support.helper';
import { SUPPORT_CHAT_TEST as T } from '../constants/support-chat.constant';
import { SUPPORT_HELPER as H } from '../constants/support-helper.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Reaction } from '../interfaces/reaction.interface';
import { PresenceEntry } from '../interfaces/support-chat.interface';
import { SupportEditDto, SupportReactDto, SupportRemoveDto, SupportThreadDto, SupportTokenDto } from '../interfaces/support-test.interface';

export class SupportActionsTestHelper {
  static heartbeat ({ token }: SupportTokenDto): Promise<ApiResponse<unknown>> {
    return ApiHelper.request({ method: 'POST', path: H.HEARTBEAT_PATH, token, body: {} });
  }

  static presence ({ token }: SupportTokenDto): Promise<ApiResponse<PresenceEntry[]>> {
    return ApiHelper.request<PresenceEntry[]>({ path: H.PRESENCE_PATH, token });
  }

  static markRead ({ token, conversationId }: SupportThreadDto): Promise<ApiResponse<unknown>> {
    return ApiHelper.request({ method: 'POST', path: `${T.CONVERSATIONS_PATH}/${conversationId}${H.READ_SUFFIX}`, token, body: {} });
  }

  static react ({ token, path, emoji }: SupportReactDto): Promise<ApiResponse<Reaction[]>> {
    return ApiHelper.request<Reaction[]>({ method: emoji ? 'PUT' : 'DELETE', path, token, ...(emoji && { body: { emoji } }) });
  }

  static remove ({ token, conversationId, messageId, scope }: SupportRemoveDto): Promise<ApiResponse<unknown>> {
    const path = `${SupportTestHelper.messagesPath({ conversationId })}${H.PATH_SEPARATOR}${messageId}${H.SCOPE_QUERY}${scope}`;
    return ApiHelper.request({ method: 'DELETE', path, token });
  }

  static editText ({ token, conversationId, messageId, text }: SupportEditDto): Promise<Response> {
    const form = new FormData();
    form.append(H.BODY_FIELD, text);
    return SupportTestHelper.multipart({ method: 'PATCH', conversationId, path: `${H.MESSAGES_SUFFIX}${H.PATH_SEPARATOR}${messageId}`, token, form });
  }
}

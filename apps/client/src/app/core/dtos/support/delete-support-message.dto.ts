import type { DeleteScope } from '../../types/support/delete-scope.type';

export interface DeleteSupportMessageDto {
  conversationId: string;
  messageId: string;
  scope: DeleteScope;
}

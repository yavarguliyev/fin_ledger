import type { DeleteScope } from '../../types/support/delete-scope.type';

export interface ConfirmDeleteDto {
  conversationId: string;
  scope: DeleteScope;
}

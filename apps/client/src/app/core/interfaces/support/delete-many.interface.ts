import { DeleteScope } from '../../types/support/delete-scope.type';

export interface DeleteManyDto {
  conversationId: string;
  messageIds: string[];
  scope: DeleteScope;
}

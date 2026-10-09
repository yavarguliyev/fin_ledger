import { DeleteScope } from '../../types/support/delete-scope.type';
import { SupportMessage } from '../../types/support/support-message.type';

export interface BulkDeleteDto {
  messages: SupportMessage[];
  scope: DeleteScope;
}

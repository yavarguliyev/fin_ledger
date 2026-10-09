import { Observable } from 'rxjs';

import { ConversationPatch } from '../../types/support/conversation-patch.type';

export interface PreferenceRequestDto {
  request: Observable<ConversationPatch>;
}

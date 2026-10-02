import type { Observable } from 'rxjs';

import type { SupportMessage } from '../../types/support/support-message.type';

export interface ComposeRequestDto {
  request: Observable<SupportMessage | SupportMessage[]>;
  failure: string;
  onNetworkFailure?: () => void;
}

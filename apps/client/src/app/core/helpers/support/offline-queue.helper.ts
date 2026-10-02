import { CaughtErrorDto } from '../../interfaces/common/caught-error.interface';
import { HTTP_ERRORS } from '../../constants/http/http-errors.constant';
import { HttpRequestError } from '../../errors/http-request.error';
import { PendingForDto } from '../../interfaces/support/pending-for.interface';
import { PendingMessage } from '../../interfaces/support/pending-message.interface';

export class OfflineQueueHelper {
  static isNetworkFailure ({ error }: CaughtErrorDto): boolean {
    return error instanceof HttpRequestError && error.status === HTTP_ERRORS.OFFLINE_STATUS;
  }

  static pendingFor ({ pending, conversationId }: PendingForDto): PendingMessage[] {
    return conversationId ? pending.filter(item => item.conversationId === conversationId) : [];
  }
}

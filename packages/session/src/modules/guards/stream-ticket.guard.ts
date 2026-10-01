import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestScope } from '@common/shared-libs';

import { AUTH_CONSTANTS } from '../constants/auth/auth.constant';
import { StreamTicketService } from '../services/stream-ticket.service';
import { RequestContext } from '../interfaces/request-context.interface';
import { RequestRefDto } from '../dtos/guard/request-ref.dto';

@Injectable()
export class StreamTicketGuard implements CanActivate {
  constructor (private readonly streamTicketService: StreamTicketService) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestContext>();
    const session = await this.streamTicketService.claim({ ticket: this.extractTicket({ request }) });
    if (!session) throw new UnauthorizedException(AUTH_CONSTANTS.STREAM_TICKET_INVALID_MESSAGE);

    request.user = session;
    const scope = RequestScope.current();
    if (scope) scope.actorId = session.userId;

    return true;
  }

  private extractTicket ({ request }: RequestRefDto): string {
    const ticket = request.query?.[AUTH_CONSTANTS.STREAM_TICKET_PARAM];
    if (typeof ticket === 'string' && ticket) return ticket;
    throw new UnauthorizedException(AUTH_CONSTANTS.STREAM_TICKET_MISSING_MESSAGE);
  }
}

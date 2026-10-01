import { Injectable } from '@nestjs/common';
import { StreamTicketService } from '@common/libs';

import { IssueStreamTicketDto } from '../../../dtos/input/issue-stream-ticket.dto';
import { StreamTicketResponseDto } from '../../../dtos/response/stream-ticket-response.dto';

@Injectable()
export class IssueSupportStreamTicketUseCase {
  constructor (private readonly streamTicketService: StreamTicketService) {}

  async execute ({ session }: IssueStreamTicketDto): Promise<StreamTicketResponseDto> {
    return { ticket: await this.streamTicketService.issue({ session }) };
  }
}

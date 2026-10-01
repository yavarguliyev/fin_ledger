import { Inject, Injectable } from '@nestjs/common';
import { StreamTicketService } from '@common/libs';

import { IssueStreamTicketRequestDto } from '../../dtos/input/issue-stream-ticket-request.dto';
import { StreamTicketResponseDto } from '../../dtos/response/stream-ticket-response.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';

@Injectable()
export class IssueStreamTicketUseCase extends NotificationBaseUseCase<IssueStreamTicketRequestDto, StreamTicketResponseDto> {
  constructor (@Inject(StreamTicketService) private readonly streamTicketService: StreamTicketService) {
    super();
  }

  async execute ({ session }: IssueStreamTicketRequestDto): Promise<StreamTicketResponseDto> {
    return { ticket: await this.streamTicketService.issue({ session }) };
  }
}

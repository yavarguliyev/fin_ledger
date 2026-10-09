import { Injectable } from '@nestjs/common';
import { SupportMessageContract } from '@common/libs';

import { ListPinsUseCase } from '../queries/list-pins.use-case';
import { MessagePinDto } from '../../dtos/input/message-pin.dto';
import { SUPPORT_EVENTS, SupportStreamProvider, SupportThreadProvider } from '../../../support';
import { SupportPinsRepository } from '../../repositories/support-pins.repository';

@Injectable()
export class UnpinMessageUseCase {
  constructor (
    private readonly thread: SupportThreadProvider,
    private readonly pinsRepository: SupportPinsRepository,
    private readonly stream: SupportStreamProvider,
    private readonly listPinsUseCase: ListPinsUseCase
  ) {}

  async execute ({ conversationId, messageId, userId, role }: MessagePinDto): Promise<SupportMessageContract[]> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    await this.pinsRepository.unpin({ messageId, conversationId, userId, role });

    this.stream.broadcast({
      type: SUPPORT_EVENTS.CONVERSATION_UPDATED,
      conversationId,
      customerUserId: conversation.customerUserId,
      assignedStaffId: conversation.assignedStaffId,
      pinsChanged: true
    });
    return this.listPinsUseCase.execute({ conversationId, userId, role });
  }
}

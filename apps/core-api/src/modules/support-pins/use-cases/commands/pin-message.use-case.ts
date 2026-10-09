import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportMessageContract, SupportMessageKind, SupportMessageSource } from '@common/libs';

import { ListPinsUseCase } from '../queries/list-pins.use-case';
import { PinMessageDto } from '../../dtos/input/pin-message.dto';
import { SUPPORT_EVENTS, SupportMapperHelper, SupportMessageRepository, SupportStreamProvider, SupportThreadProvider } from '../../../support';
import { SUPPORT_PINS } from '../../constants/support-pins.constant';
import { SupportPinsRepository } from '../../repositories/support-pins.repository';

@Injectable()
export class PinMessageUseCase {
  constructor (
    private readonly thread: SupportThreadProvider,
    private readonly pinsRepository: SupportPinsRepository,
    private readonly messageRepository: SupportMessageRepository,
    private readonly stream: SupportStreamProvider,
    private readonly listPinsUseCase: ListPinsUseCase
  ) {}

  async execute ({ conversationId, messageId, userId, role, duration }: PinMessageDto): Promise<SupportMessageContract[]> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const pinned = await this.pinsRepository.pin({ messageId, conversationId, userId, seconds: SUPPORT_PINS.DURATION_SECONDS[duration] });
    if (!pinned) throw new NotFoundException(SUPPORT_PINS.NOT_PINNABLE_MESSAGE);

    const row = await this.messageRepository.add({
      conversationId,
      senderUserId: userId,
      kind: SupportMessageKind.SYSTEM,
      source: SupportMessageSource.SYSTEM,
      body: SUPPORT_PINS.NOTICE
    });
    if (row) await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_CREATED, conversation, senderUserId: userId, role, messages: [SupportMapperHelper.toMessage({ row })] });

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

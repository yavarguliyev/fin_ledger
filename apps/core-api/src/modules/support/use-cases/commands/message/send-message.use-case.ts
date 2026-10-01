import { BadRequestException, Injectable } from '@nestjs/common';
import { SupportMessageKind, SupportMessageSource } from '@common/libs';
import { SupportMessageContract } from '@common/contracts';

import { SUPPORT } from '../../../constants/chat/support.constant';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SendMessageDto } from '../../../dtos/input/send-message.dto';
import { SupportMapperHelper } from '../../../helpers/support-mapper.helper';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class SendMessageUseCase {
  constructor (
    private readonly messageRepository: SupportMessageRepository,
    private readonly thread: SupportThreadProvider
  ) {}

  async execute ({ conversationId, senderUserId, role, body, kind, source }: SendMessageDto): Promise<SupportMessageContract> {
    const conversation = await this.thread.requireOpen({ conversationId, userId: senderUserId, role });

    const text = body?.trim();
    if (!text) throw new BadRequestException(SUPPORT.EMPTY_MESSAGE);

    const row = await this.messageRepository.add({
      conversationId,
      senderUserId,
      kind: kind ?? SupportMessageKind.TEXT,
      source: source ?? SupportMessageSource.WEB,
      body: text
    });

    if (!row) throw new BadRequestException(SUPPORT.EMPTY_MESSAGE);

    const message = SupportMapperHelper.toMessage({ row });
    await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_CREATED, conversation, senderUserId, role, messages: [message] });

    return message;
  }
}

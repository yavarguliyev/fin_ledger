import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { MESSAGE_STAR } from '../../../constants/chat/message-star.constant';
import { StarMessageDto } from '../../../dtos/input/star-message.dto';
import { StarredMessageDto } from '../../../dtos/message/starred-message.dto';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportStarRepository } from '../../../repositories/support-star.repository';

@Injectable()
export class StarMessageUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly messageRepository: SupportMessageRepository,
    private readonly starRepository: SupportStarRepository
  ) {}

  async execute ({ conversationId, messageId, userId, role, starred }: StarMessageDto): Promise<StarredMessageDto[]> {
    await this.access.require({ conversationId, userId, role });
    const message = await this.messageRepository.findById({ id: messageId });
    if (message?.conversationId !== conversationId) throw new NotFoundException(MESSAGE_STAR.NOT_FOUND_MESSAGE);

    if (!starred) await this.starRepository.unstar({ messageId, userId });
    else if (message.deletedAt) throw new BadRequestException(MESSAGE_STAR.DELETED_MESSAGE);
    else await this.starRepository.star({ messageId, userId });

    return this.starRepository.listFor({ userId, conversationId });
  }
}

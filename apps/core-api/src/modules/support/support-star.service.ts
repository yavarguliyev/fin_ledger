import { Injectable } from '@nestjs/common';

import { ReadConversationDto } from './dtos/input/read-conversation.dto';
import { StarMessageDto } from './dtos/input/star-message.dto';
import { StarredMessageDto } from './dtos/message/starred-message.dto';
import { ListStarredMessagesUseCase } from './use-cases/queries/message/list-starred-messages.use-case';
import { StarMessageUseCase } from './use-cases/commands/message/star-message.use-case';

@Injectable()
export class SupportStarService {
  constructor (
    private readonly starMessageUseCase: StarMessageUseCase,
    private readonly listStarredMessagesUseCase: ListStarredMessagesUseCase
  ) {}

  async star (dto: StarMessageDto): Promise<StarredMessageDto[]> {
    return this.starMessageUseCase.execute(dto);
  }

  async list (dto: ReadConversationDto): Promise<StarredMessageDto[]> {
    return this.listStarredMessagesUseCase.execute(dto);
  }
}

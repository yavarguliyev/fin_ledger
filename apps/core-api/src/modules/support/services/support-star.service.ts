import { Injectable } from '@nestjs/common';

import { ReadConversationDto } from '../dtos/input/read-conversation.dto';
import { StarMessageDto } from '../dtos/input/star-message.dto';
import { StarredMessageDto } from '../dtos/message/starred-message.dto';
import { ListStarredMessagesUseCase } from '../use-cases/queries/message/list-starred-messages.use-case';
import { StarMessageUseCase } from '../use-cases/commands/message/star-message.use-case';
import { ListAllStarredUseCase } from '../use-cases/queries/message/list-all-starred.use-case';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class SupportStarService {
  constructor (
    private readonly starMessageUseCase: StarMessageUseCase,
    private readonly listStarredMessagesUseCase: ListStarredMessagesUseCase,
    private readonly listAllStarredUseCase: ListAllStarredUseCase
  ) {}

  async listAll (dto: UserRefDto): Promise<StarredMessageDto[]> {
    return this.listAllStarredUseCase.execute(dto);
  }

  async star (dto: StarMessageDto): Promise<StarredMessageDto[]> {
    return this.starMessageUseCase.execute(dto);
  }

  async list (dto: ReadConversationDto): Promise<StarredMessageDto[]> {
    return this.listStarredMessagesUseCase.execute(dto);
  }
}

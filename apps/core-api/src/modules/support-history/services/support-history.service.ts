import { Injectable } from '@nestjs/common';

import { ClearChatDto } from '../dtos/input/clear-chat.dto';
import { ClearChatUseCase } from '../use-cases/commands/clear-chat.use-case';
import { ClearedResponseDto } from '../dtos/response/cleared-response.dto';
import { DeletedMessagesResponseDto } from '../dtos/response/deleted-messages-response.dto';
import { DeleteMessagesDto } from '../dtos/input/delete-messages.dto';
import { DeleteMessagesUseCase } from '../use-cases/commands/delete-messages.use-case';

@Injectable()
export class SupportHistoryService {
  constructor (
    private readonly clearChatUseCase: ClearChatUseCase,
    private readonly deleteMessagesUseCase: DeleteMessagesUseCase
  ) {}

  async clear (dto: ClearChatDto): Promise<ClearedResponseDto> {
    return this.clearChatUseCase.execute(dto);
  }

  async deleteMany (dto: DeleteMessagesDto): Promise<DeletedMessagesResponseDto> {
    return this.deleteMessagesUseCase.execute(dto);
  }
}

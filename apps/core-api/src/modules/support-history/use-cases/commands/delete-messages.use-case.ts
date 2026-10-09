import { Injectable } from '@nestjs/common';

import { DeleteMessageUseCase } from '../../../support';
import { DeleteMessagesDto } from '../../dtos/input/delete-messages.dto';
import { DeletedMessagesResponseDto } from '../../dtos/response/deleted-messages-response.dto';

@Injectable()
export class DeleteMessagesUseCase {
  constructor (private readonly deleteMessageUseCase: DeleteMessageUseCase) {}

  async execute ({ conversationId, userId, role, scope, messageIds }: DeleteMessagesDto): Promise<DeletedMessagesResponseDto> {
    let deleted = 0;
    for (const messageId of new Set(messageIds)) {
      const done = await this.deleteMessageUseCase.execute({ conversationId, messageId, userId, role, scope }).then(
        () => true,
        () => false
      );
      if (done) deleted += 1;
    }
    return { deleted, failed: new Set(messageIds).size - deleted };
  }
}

import { Injectable } from '@nestjs/common';
import { SupportMessageContract } from '@common/contracts';

import { ListThreadDto } from '../../../dtos/input/list-thread.dto';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';

@Injectable()
export class ListMessagesUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly messageRepository: SupportMessageRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute ({ id, actorId, role, ...page }: ListThreadDto): Promise<SupportMessageContract[]> {
    await this.access.require({ conversationId: id, userId: actorId, role });

    const rows = await this.messageRepository.listThread({ ...page, conversationId: id, actorId });

    return this.attachments.toContracts({ rows });
  }
}

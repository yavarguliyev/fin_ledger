import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupportConversationContract } from '@common/contracts';

import { OpenConversationDto } from '../../../dtos/input/open-conversation.dto';
import { SUPPORT } from '../../../constants/chat/support.constant';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { SupportMapperHelper } from '../../../helpers/support-mapper.helper';
import { SupportContactRepository } from '../../../repositories/support-contact.repository';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';

@Injectable()
export class OpenConversationUseCase {
  constructor (
    private readonly conversationRepository: SupportConversationRepository,
    private readonly contactRepository: SupportContactRepository
  ) {}

  async execute (dto: OpenConversationDto): Promise<SupportConversationContract> {
    if (SupportAccessHelper.isStaff({ role: dto.role })) throw new BadRequestException(SUPPORT.STAFF_CANNOT_OPEN_MESSAGE);

    const staff = await this.contactRepository.findStaff(dto);
    if (!staff) throw new NotFoundException(SUPPORT.STAFF_NOT_FOUND_MESSAGE);

    const opened = await this.conversationRepository.openOrGet(dto);
    if (!opened) throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);

    const conversation = await this.conversationRepository.findById({ id: opened.id });
    if (!conversation) throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);

    return SupportMapperHelper.toConversation({ row: conversation });
  }
}

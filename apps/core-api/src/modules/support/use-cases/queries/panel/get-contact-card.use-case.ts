import { Injectable, NotFoundException } from '@nestjs/common';

import { ContactCardResponseDto } from '../../../dtos/response/contact-card-response.dto';
import { ReadConversationDto } from '../../../dtos/input/read-conversation.dto';
import { SUPPORT_PANEL } from '../../../constants/chat/support-panel.constant';
import { SupportAccessProvider } from '../../../providers/support-access.provider';
import { SupportContactRepository } from '../../../repositories/support-contact.repository';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';

@Injectable()
export class GetContactCardUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly contactRepository: SupportContactRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute ({ conversationId, userId, role }: ReadConversationDto): Promise<ContactCardResponseDto> {
    const conversation = await this.access.require({ conversationId, userId, role });

    if (conversation.customerUserId === userId) {
      const staff = conversation.assignedStaffId ? await this.contactRepository.findName({ userId: conversation.assignedStaffId }) : null;
      return { isStaff: true, team: SUPPORT_PANEL.SUPPORT_TEAM_NAME, name: staff?.name ?? null, avatarUrl: await this.attachments.avatarUrl({ storageKey: staff?.avatarKey ?? null }) };
    }

    const card = await this.contactRepository.customerCard({ userId: conversation.customerUserId });
    if (!card) throw new NotFoundException(SUPPORT_PANEL.CONTACT_NOT_FOUND_MESSAGE);
    const { avatarKey, ...rest } = card;
    return { ...rest, avatarUrl: await this.attachments.avatarUrl({ storageKey: avatarKey ?? null }) };
  }
}

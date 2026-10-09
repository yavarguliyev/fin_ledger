import { Injectable } from '@nestjs/common';

import { ListPresenceDto } from '../../../dtos/input/list-presence.dto';
import { PresenceEntryDto } from '../../../dtos/presence/presence-entry.dto';
import { PresenceHelper } from '../../../helpers/presence.helper';
import { PresenceStatusProvider } from '../../../providers/presence-status.provider';
import { SupportContactRepository } from '../../../repositories/support-contact.repository';
import { SupportAttachmentProvider } from '../../../providers/support-attachment.provider';

@Injectable()
export class ListContactsUseCase {
  constructor (
    private readonly contactRepository: SupportContactRepository,
    private readonly statuses: PresenceStatusProvider,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute ({ actorId }: ListPresenceDto): Promise<PresenceEntryDto[]> {
    const contacts = await this.contactRepository.listStaff({ userId: actorId });

    const statuses = await this.statuses.statuses({ userIds: contacts.map(contact => contact.userId) });

    return Promise.all(
      contacts.map(async ({ avatarKey, ...contact }, index) => ({
        ...PresenceHelper.forContact({ contact, online: statuses[index]?.online ?? false, lastSeenAt: statuses[index]?.lastSeenAt ?? null }),
        avatarUrl: await this.attachments.avatarUrl({ storageKey: avatarKey ?? null })
      }))
    );
  }
}

import { Injectable } from '@nestjs/common';

import { ListPresenceDto } from '../../../dtos/input/list-presence.dto';
import { PresenceEntryDto } from '../../../dtos/presence/presence-entry.dto';
import { PresenceHelper } from '../../../helpers/presence.helper';
import { PresenceRepository } from '../../../repositories/presence.repository';
import { SupportContactRepository } from '../../../repositories/support-contact.repository';

@Injectable()
export class ListContactsUseCase {
  constructor (
    private readonly contactRepository: SupportContactRepository,
    private readonly presenceRepository: PresenceRepository
  ) {}

  async execute ({ actorId }: ListPresenceDto): Promise<PresenceEntryDto[]> {
    const contacts = await this.contactRepository.listStaff({ userId: actorId });

    return Promise.all(
      contacts.map(async contact => {
        const online = await this.presenceRepository.isOnline({ userId: contact.userId });
        const lastSeenAt = await this.presenceRepository.lastSeen({ userId: contact.userId });
        return PresenceHelper.forContact({ contact, online, lastSeenAt });
      })
    );
  }
}

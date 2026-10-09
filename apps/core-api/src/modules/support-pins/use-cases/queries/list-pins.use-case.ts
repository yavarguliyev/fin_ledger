import { Injectable } from '@nestjs/common';
import { SupportMessageContract } from '@common/libs';

import { ReadConversationDto, SupportAccessProvider, SupportAttachmentProvider } from '../../../support';
import { SupportPinsRepository } from '../../repositories/support-pins.repository';

@Injectable()
export class ListPinsUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly pinsRepository: SupportPinsRepository,
    private readonly attachments: SupportAttachmentProvider
  ) {}

  async execute (dto: ReadConversationDto): Promise<SupportMessageContract[]> {
    await this.access.require(dto);
    return this.attachments.toContracts({ rows: await this.pinsRepository.list(dto) });
  }
}

import { Injectable } from '@nestjs/common';
import { SupportMessageContract } from '@common/contracts';

import { ContactCardResponseDto } from '../dtos/response/contact-card-response.dto';
import { DeletedFilesResponseDto } from '../dtos/response/deleted-files-response.dto';
import { DeleteOwnFilesDto } from '../dtos/input/delete-own-files.dto';
import { DeleteOwnFilesUseCase } from '../use-cases/commands/panel/delete-own-files.use-case';
import { GetContactCardUseCase } from '../use-cases/queries/panel/get-contact-card.use-case';
import { GetConversationStorageUseCase } from '../use-cases/queries/panel/get-conversation-storage.use-case';
import { ListConversationFilesUseCase } from '../use-cases/queries/panel/list-conversation-files.use-case';
import { ListConversationLinksUseCase } from '../use-cases/queries/panel/list-conversation-links.use-case';
import { MessageLinkDto } from '../dtos/message/message-link.dto';
import { PanelFilesDto } from '../dtos/input/panel-files.dto';
import { PanelPageDto } from '../dtos/input/panel-page.dto';
import { ReadConversationDto } from '../dtos/input/read-conversation.dto';
import { StorageSummaryResponseDto } from '../dtos/response/storage-summary-response.dto';

@Injectable()
export class SupportPanelService {
  constructor (
    private readonly getContactCardUseCase: GetContactCardUseCase,
    private readonly listConversationFilesUseCase: ListConversationFilesUseCase,
    private readonly listConversationLinksUseCase: ListConversationLinksUseCase,
    private readonly getConversationStorageUseCase: GetConversationStorageUseCase,
    private readonly deleteOwnFilesUseCase: DeleteOwnFilesUseCase
  ) {}

  async contact (dto: ReadConversationDto): Promise<ContactCardResponseDto> {
    return this.getContactCardUseCase.execute(dto);
  }

  async files (dto: PanelFilesDto): Promise<SupportMessageContract[]> {
    return this.listConversationFilesUseCase.execute(dto);
  }

  async links (dto: PanelPageDto): Promise<MessageLinkDto[]> {
    return this.listConversationLinksUseCase.execute(dto);
  }

  async storage (dto: ReadConversationDto): Promise<StorageSummaryResponseDto> {
    return this.getConversationStorageUseCase.execute(dto);
  }

  async deleteFiles (dto: DeleteOwnFilesDto): Promise<DeletedFilesResponseDto> {
    return this.deleteOwnFilesUseCase.execute(dto);
  }
}

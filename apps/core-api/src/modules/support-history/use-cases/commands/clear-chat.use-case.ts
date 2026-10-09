import { Injectable } from '@nestjs/common';

import { ClearChatDto } from '../../dtos/input/clear-chat.dto';
import { ClearedResponseDto } from '../../dtos/response/cleared-response.dto';
import { SupportAccessProvider } from '../../../support';
import { SupportHistoryRepository } from '../../repositories/support-history.repository';

@Injectable()
export class ClearChatUseCase {
  constructor (
    private readonly access: SupportAccessProvider,
    private readonly historyRepository: SupportHistoryRepository
  ) {}

  async execute (dto: ClearChatDto): Promise<ClearedResponseDto> {
    await this.access.require(dto);
    return { cleared: await this.historyRepository.clear(dto) };
  }
}

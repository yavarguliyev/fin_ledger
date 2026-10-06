import { Injectable } from '@nestjs/common';

import { ChangePrivacyDto } from '../dtos/input/change-privacy.dto';
import { ChangePrivacyUseCase } from '../use-cases/commands/conversation/change-privacy.use-case';
import { DownloadUrlResponseDto } from '../dtos/response/download-url-response.dto';
import { GetDownloadUrlUseCase } from '../use-cases/queries/message/get-download-url.use-case';
import { MessageAccessDto } from '../dtos/input/message-access.dto';
import { PrivacyResponseDto } from '../dtos/response/privacy-response.dto';

@Injectable()
export class SupportPrivacyService {
  constructor (
    private readonly changePrivacyUseCase: ChangePrivacyUseCase,
    private readonly getDownloadUrlUseCase: GetDownloadUrlUseCase
  ) {}

  async change (dto: ChangePrivacyDto): Promise<PrivacyResponseDto> {
    return this.changePrivacyUseCase.execute(dto);
  }

  async download (dto: MessageAccessDto): Promise<DownloadUrlResponseDto> {
    return this.getDownloadUrlUseCase.execute(dto);
  }
}

import { Injectable } from '@nestjs/common';

import { LinkPreviewRequestDto } from './dtos/link/link-preview-request.dto';
import { LinkPreviewResponseDto } from './dtos/link/link-preview-response.dto';
import { GetLinkPreviewUseCase } from './use-cases/queries/link/get-link-preview.use-case';

@Injectable()
export class SupportLinkService {
  constructor (private readonly getLinkPreviewUseCase: GetLinkPreviewUseCase) {}

  async preview (dto: LinkPreviewRequestDto): Promise<LinkPreviewResponseDto> {
    return this.getLinkPreviewUseCase.execute(dto);
  }
}

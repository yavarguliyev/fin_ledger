import { Injectable } from '@nestjs/common';
import { Cacheable } from '@common/libs';

import { LINK_PREVIEW } from '../constants/link/link-preview.constant';
import { LinkPreviewRequestDto } from '../dtos/link/link-preview-request.dto';
import { LinkPreviewResponseDto } from '../dtos/link/link-preview-response.dto';
import { GetLinkPreviewUseCase } from '../use-cases/queries/link/get-link-preview.use-case';

@Injectable()
export class SupportLinkService {
  constructor (
    private readonly getLinkPreviewUseCase: GetLinkPreviewUseCase
  ) {}

  @Cacheable({ keyPrefix: LINK_PREVIEW.CACHE_PREFIX, ttlSeconds: LINK_PREVIEW.CACHE_TTL_SECONDS })
  async preview (dto: LinkPreviewRequestDto): Promise<LinkPreviewResponseDto> {
    return this.getLinkPreviewUseCase.execute(dto);
  }
}

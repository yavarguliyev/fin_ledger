import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { CacheProvider, REDIS_CACHE_PROVIDER } from '@common/libs';

import { LINK_PREVIEW } from '../constants/link/link-preview.constant';
import { LinkPreviewRequestDto } from '../dtos/link/link-preview-request.dto';
import { LinkPreviewResponseDto } from '../dtos/link/link-preview-response.dto';
import { SaveLinkPreviewDto } from '../dtos/link/save-link-preview.dto';

@Injectable()
export class LinkPreviewRepository {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly cache: CacheProvider) {}

  async find ({ url }: LinkPreviewRequestDto): Promise<LinkPreviewResponseDto | null> {
    return this.cache.get<LinkPreviewResponseDto>({ key: this.keyFor({ url }) });
  }

  async save ({ preview }: SaveLinkPreviewDto): Promise<void> {
    await this.cache.set({ key: this.keyFor({ url: preview.url }), value: preview, ttlSeconds: LINK_PREVIEW.CACHE_TTL_SECONDS });
  }

  private keyFor ({ url }: LinkPreviewRequestDto): string {
    return `${LINK_PREVIEW.CACHE_PREFIX}${createHash(LINK_PREVIEW.DIGEST).update(url).digest(LINK_PREVIEW.ENCODING)}`;
  }
}

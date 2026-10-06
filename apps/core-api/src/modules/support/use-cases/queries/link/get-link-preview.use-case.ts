import { BadRequestException, Injectable } from '@nestjs/common';
import { HtmlMetaHelper } from '@common/libs';

import { LINK_PREVIEW } from '../../../constants/link/link-preview.constant';
import { LinkPreviewRequestDto } from '../../../dtos/link/link-preview-request.dto';
import { LinkPreviewResponseDto } from '../../../dtos/link/link-preview-response.dto';
import { LinkPreviewFetchHelper } from '../../../helpers/link-preview-fetch.helper';

@Injectable()
export class GetLinkPreviewUseCase {
  async execute ({ url }: LinkPreviewRequestDto): Promise<LinkPreviewResponseDto> {
    const page = await LinkPreviewFetchHelper.html({ url, redirectsLeft: LINK_PREVIEW.MAX_REDIRECTS }).catch((error: unknown) => {
      if (error instanceof BadRequestException) throw error;
      return null;
    });
    return { url, ...(page && HtmlMetaHelper.preview(page)) };
  }
}

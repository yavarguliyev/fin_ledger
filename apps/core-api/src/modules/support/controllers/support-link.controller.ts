import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, SessionGuard } from '@common/libs';

import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { LINK_PREVIEW } from '../constants/link/link-preview.constant';
import { LinkPreviewRequestDto, LinkPreviewRequestSchema } from '../dtos/link/link-preview-request.dto';
import { LinkPreviewResponseDto } from '../dtos/link/link-preview-response.dto';
import { SupportLinkService } from '../services/support-link.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportLinkController {
  constructor (private readonly supportLinkService: SupportLinkService) {}

  @UseGuards(SessionGuard)
  @ChatRateLimit()
  @Get(LINK_PREVIEW.PATH)
  async preview (@ParamsQueryAndHeaders({ schema: LinkPreviewRequestSchema }) dto: LinkPreviewRequestDto): Promise<LinkPreviewResponseDto> {
    return this.supportLinkService.preview(dto);
  }
}

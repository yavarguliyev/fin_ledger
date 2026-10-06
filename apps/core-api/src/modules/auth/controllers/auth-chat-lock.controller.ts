import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, RequestContext, SessionGuard, UserRateLimit } from '@common/libs';

import { ChatLockRequestDto, ChatLockRequestSchema } from '../dtos/passkeys/chat-lock-request.dto';
import { ChatLockService } from '../services/chat-lock.service';
import { LockResponseDto } from '../../support';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.AUTH.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.AUTH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class AuthChatLockController {
  constructor (private readonly chatLockService: ChatLockService) {}

  @UserRateLimit()
  @Post('passkeys/chat-lock')
  async lock (@Req() req: RequestContext, @Body({ schema: ChatLockRequestSchema }) dto: ChatLockRequestDto): Promise<LockResponseDto> {
    return this.chatLockService.lock({ ...dto, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @UserRateLimit()
  @Post('passkeys/chat-unlock')
  async unlock (@Req() req: RequestContext, @Body({ schema: ChatLockRequestSchema }) dto: ChatLockRequestDto): Promise<LockResponseDto> {
    return this.chatLockService.unlock({ ...dto, userId: req.user.userId, role: req.user.role ?? '' });
  }
}

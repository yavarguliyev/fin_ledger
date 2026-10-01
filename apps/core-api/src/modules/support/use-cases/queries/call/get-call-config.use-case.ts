import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CallConfigResponseDto, CallConfigResponseSchema } from '../../../dtos/response/call-config-response.dto';
import { SUPPORT_CALL } from '../../../constants/call/support-call.constant';

@Injectable()
export class GetCallConfigUseCase {
  constructor (private readonly configService: ConfigService) {}

  execute (): CallConfigResponseDto {
    const raw = this.configService.get<string>(SUPPORT_CALL.ICE_SERVERS_KEY);
    if (!raw) return { iceServers: [] };

    try {
      const parsed = CallConfigResponseSchema.safeParse({ iceServers: JSON.parse(raw) as unknown });
      return parsed.success ? parsed.data : { iceServers: [] };
    } catch {
      return { iceServers: [] };
    }
  }
}

import { ConfigService } from '@nestjs/config';
import { SessionService } from '@common/libs';

import { SessionUserDto } from './auth/session-user.dto';

export type CreateSessionResponseDto = {
  dto: SessionUserDto;
  sessionService: SessionService;
  configService?: ConfigService | undefined;
  isAuth?: boolean | undefined;
  walletId?: string | undefined;
  ledgerAccountId?: string | undefined;
};

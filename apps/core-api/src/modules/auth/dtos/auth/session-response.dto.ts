import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { SessionService } from '@common/libs';

import { AuthResponseDto } from './auth-response.dto';
import { UserUpdateResponeDto } from '../../../user/dtos/update/user-update-response.dto';
import { SessionUserDto } from './session-user.dto';

export const SessionRequestSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).optional(),
  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).optional(),
  isAuth: z.boolean({ message: 'Is Login must be a boolean' }).optional()
});

export type SessionResponseDto = AuthResponseDto | UserUpdateResponeDto;

export type SessionRequestDto = z.infer<typeof SessionRequestSchema> & {
  dto: SessionUserDto;
  sessionService: SessionService;
  configService: ConfigService;
};

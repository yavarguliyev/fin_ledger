import { Module } from '@nestjs/common';
import { ClientIds, EmailProviderModule } from '@common/libs';

import { UserRegisterHandler } from './use-cases/commands/user-register-handler.use-case';
import { PasswordResetHandler } from './use-cases/commands/password-reset-handler.use-case';

@Module({
  imports: [EmailProviderModule.forRoot(ClientIds.API_GATEWAY)],
  providers: [UserRegisterHandler, PasswordResetHandler]
})
export class EmailModule {}

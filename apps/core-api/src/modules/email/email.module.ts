import { Module } from '@nestjs/common';
import { ClientIds, MailerModule } from '@common/libs';

import { UserRegisterHandler } from './use-cases/commands/user-register-handler.use-case';
import { PasswordResetHandler } from './use-cases/commands/password-reset-handler.use-case';
import { PasswordChangedHandler } from './use-cases/commands/password-changed-handler.use-case';
import { EmailChangeConfirmHandler } from './use-cases/commands/email-change-confirm-handler.use-case';
import { EmailChangedNoticeHandler } from './use-cases/commands/email-changed-notice-handler.use-case';
import { MfaEnabledHandler } from './use-cases/commands/mfa-enabled-handler.use-case';
import { MfaDisabledHandler } from './use-cases/commands/mfa-disabled-handler.use-case';
import { SelfExclusionHandler } from './use-cases/commands/self-exclusion-handler.use-case';
import { NewDeviceHandler } from './use-cases/commands/new-device-handler.use-case';

@Module({
  imports: [MailerModule.forRoot({ clientId: ClientIds.API_GATEWAY })],
  providers: [
    UserRegisterHandler,
    PasswordResetHandler,
    PasswordChangedHandler,
    EmailChangeConfirmHandler,
    EmailChangedNoticeHandler,
    MfaEnabledHandler,
    MfaDisabledHandler,
    SelfExclusionHandler,
    NewDeviceHandler
  ]
})
export class EmailModule {}

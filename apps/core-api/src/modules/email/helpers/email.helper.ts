import { PasswordResetEventDto, UserEmailVerificationEventDto } from '../dto/email-helper.dto';

export class EmailHelper {
  public static async emitKafkaUserEmailVerification (event: UserEmailVerificationEventDto): Promise<void> {
    const { action, publishEmailVerification, ...payload } = event;
    if (action === 'email') await publishEmailVerification(payload);
  }

  public static async emitKafkaPasswordReset (event: PasswordResetEventDto): Promise<void> {
    const { action, publishPasswordReset, ...payload } = event;
    if (action === 'password_reset') await publishPasswordReset(payload);
  }
}

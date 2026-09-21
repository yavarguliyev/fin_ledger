import { EmitEmailVerificationDto } from '../dtos/helper/emit-email-verification.dto';
import { EmitPasswordResetDto } from '../dtos/helper/emit-password-reset.dto';

export class EmailHelper {
  static async emitKafkaUserEmailVerification (event: EmitEmailVerificationDto): Promise<void> {
    const { action, publishEmailVerification, ...payload } = event;
    if (action === 'email') await publishEmailVerification(payload);
  }

  static async emitKafkaPasswordReset (event: EmitPasswordResetDto): Promise<void> {
    const { action, publishPasswordReset, ...payload } = event;
    if (action === 'password_reset') await publishPasswordReset(payload);
  }
}

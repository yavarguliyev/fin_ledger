import { EmitEmailVerificationDto } from '../dtos/helper/emit-email-verification.dto';
import { EmitPasswordResetDto } from '../dtos/helper/emit-password-reset.dto';

export class EmailHelper {
  static async emitKafkaUserEmailVerification (event: EmitEmailVerificationDto): Promise<void> {
    const { action, publishEmailVerification, userId, ...payload } = event;
    if (action === 'email') await publishEmailVerification(payload, userId);
  }

  static async emitKafkaPasswordReset (event: EmitPasswordResetDto): Promise<void> {
    const { action, publishPasswordReset, userId, ...payload } = event;
    if (action === 'password_reset') await publishPasswordReset(payload, userId);
  }
}

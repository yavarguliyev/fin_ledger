import { PasswordResetEventDto } from '../../dto/password-reset-event.dto';

export const emitKafkaPasswordReset = async (event: PasswordResetEventDto): Promise<void> => {
  const { action, publishPasswordReset, ...payload } = event;
  if (action === 'password_reset') await publishPasswordReset(payload);
};

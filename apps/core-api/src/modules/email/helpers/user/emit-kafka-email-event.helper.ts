import { UserEmailVerificationEventDto } from '../../dto/user-email-verification-event.dto';

export const emitKafkaUserEmailVerification = async (event: UserEmailVerificationEventDto): Promise<void> => {
  const { action, publishEmailVerification, ...payload } = event;
  if (action === 'email') await publishEmailVerification(payload);
};

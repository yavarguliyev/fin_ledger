import { SendEmailDto } from '@common/libs';

export type UserEmailVerificationEventDto = SendEmailDto & {
  action: 'email';
  publishEmailVerification: (payload: SendEmailDto) => Promise<SendEmailDto>;
};

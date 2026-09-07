import { SendEmailDto } from '@common/libs';

export type PasswordResetEventDto = SendEmailDto & {
  action: 'password_reset';
  publishPasswordReset: (payload: SendEmailDto) => Promise<SendEmailDto>;
};

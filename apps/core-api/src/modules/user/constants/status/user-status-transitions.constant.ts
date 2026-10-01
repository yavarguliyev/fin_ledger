import { UserStatus } from '@common/libs';

export const USER_STATUS_TRANSITIONS: Readonly<Partial<Record<UserStatus, readonly UserStatus[]>>> = {
  [UserStatus.ACTIVE]: [UserStatus.SUSPENDED],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE]
};

import { UserRoles } from '@common/libs';

export const MFA_POLICY = {
  REQUIRED_ROLES: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] as readonly UserRoles[]
} as const;

export const MFA_EMAIL = {
  ENABLED: {
    SUBJECT: 'Two-factor authentication was turned on',
    PURPOSE: 'Two-Factor Enabled',
    TITLE: 'Two-factor authentication is on',
    BODY: 'Your account now asks for a code from your authenticator app when you sign in. Keep your recovery codes somewhere safe.'
  },
  DISABLED: {
    SUBJECT: 'Two-factor authentication was turned off',
    PURPOSE: 'Two-Factor Disabled',
    TITLE: 'Two-factor authentication is off',
    BODY: 'Your account no longer asks for a code when you sign in. If this was not you, turn it back on and change your password.'
  },
  REGENERATED: 'A new set of recovery codes was created. The old ones no longer work.',
  DISABLED_MESSAGE: 'Two-factor authentication has been turned off',
  PROFILE_PATH: '/profile'
} as const;

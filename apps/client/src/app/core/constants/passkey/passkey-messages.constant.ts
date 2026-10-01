export const PASSKEY_MESSAGES = {
  UNSUPPORTED: 'This browser cannot use a passkey. Sign in with your password instead.',
  REGISTER_FAILED: 'Could not add the passkey. Try again.',
  REGISTERED: 'Passkey added. You can sign in with it from now on.',
  REMOVED: 'Passkey removed.',
  REMOVE_FAILED: 'Could not remove the passkey. Try again.',
  LOGIN_FAILED: 'That passkey did not work. Sign in with your password instead.',
  LOAD_FAILED: 'Could not load your passkeys.',
  STEP_UP_PROMPT: 'Confirm with your passkey to continue.',
  STEP_UP_FAILED: 'Could not confirm with your passkey. Try again.',
  BIOMETRIC_LABEL: 'Use Face ID or fingerprint',
  PASSKEY_LABEL: 'Use a passkey',
  NOTHING_USED: 'No passkey was used. Sign in with your password, or add one from your profile.',
  NOTHING_ADDED: 'Nothing was added. Your device or password manager did not hand back a passkey.',
  NEVER_USED: 'Never used'
} as const;
